#!/usr/local/bin/node
import { readFileSync, writeFileSync, existsSync } from "fs"
import prompts, { Answers } from "prompts"
import { homedir } from "node:os"
import { join } from "node:path"
import type { Preset } from "./types"
import { copy_folder, delete_items } from "./lib"
import { format } from "prettier-package-json"
import { exec as _exec } from "node:child_process"
import { promisify } from "node:util"
import { Spinner } from "cli-spinner"
const exec = promisify(_exec)
const spinner_string = `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`
let using_preset = true;
async function main(){
  // log create-svelte-kit in rainbow
  console.clear()
  console.log((await import('gradient-string')).pastel.multiline((await import('figlet')).textSync(`create-svelte-kit\n`)))

  // read/create presets file
  const presets_path=`${homedir()}/.create-svelte-kit.json`
  if(!existsSync(presets_path)){writeFileSync(presets_path,`[]`)}
  const presets: Preset[]=JSON.parse(readFileSync(presets_path).toString('utf-8'))
  // console.log(presets)

  // prompts
  const default_output: prompts.Answers<any>=await prompts([{
    // name
    type: 'text',
    name: 'name',
    message: 'Input the name of your app',
    validate: value=>value!=''&&value ? true : 'Please input a project name'
  },{
    // presets
    type: 'select',
    name: 'preset',
    message: 'Select a preset for your app',
    choices: [{
      title: 'Blank app (js)',
      description: 'bare-bones',
      value: 0
    },{
      title: 'Blank app (ts)',
      description: 'bare-bones (type checked)',
      value: 1
    },{
      title: 'Demo app (js)',
      description: 'good to play around',
      value: 2
    },...presets.map((item: Preset, index:number)=>{return{
      title: item.name,
      description: item.description,
      value: index+3
    }}),{
      title: 'Custom',
      description: 'create an app with you own presets',
      value: -1
    }]
  },{
    type: (prev:number)=>prev!=-1 ? null : 'multiselect',
    name: 'tech',
    message: 'Select the catergories',
    instructions: '[space] to select, [enter] to finish',
    choices:[{
      title: 'Type-checking',
      description: 'typescript/(javascript)',
      value: 0
    },{
      title: 'CSS Pre-processors',
      description: 'scss/sass/less/(css)',
      value: 1
    },{
      title: 'Database',
      description: 'sequelize/mongoose/(none)',
      value: 2
    },{
      title: 'Formatter',
      description: 'eslint/prettier/(none)',
      value: 3
    },{
      title: 'Package manager',
      description: 'npm/(yarn)',
      value: 4
    },{
      title: 'Other modules',
      description: 'any module/(none)',
      value: 5
    }]
  }])
  const default_option = (includes:any)=>{return default_output.tech.includes(includes)}

  // extra options
  const further_questions: prompts.Answers<any> | {} = default_output.preset!=-1 ? {} : await prompts([{
    type: (_:any)=>default_option(0)?'select':null,
    name: 'type',
    message: 'Type-checking',
    choices: [{
      title: 'TypeScript',
      description: 'enables type-checking',
      value: 'typescript'
    },{
      title: 'JavaScript',
      description: 'disables type-checking',
      value: 'javascript'
    }]
  },{
    type: (_:any)=>default_option(1)?'select':null,
    name: 'css',
    message: 'CSS Pre-processor',
    choices: [{
      title: 'CSS',
      description: 'none - default',
      value: 'css',      
    },{
      title: 'SCSS',
      description: 'css superset',
      value: 'scss'
    },{
      title: 'SASS',
      description: 'css sytax changes + features',
      value: 'sass'
    },{
      title: 'LESS',
      description: 'css superset - less popular',
      value: 'less'
    }]
  },{
    type: (_:any)=>default_option(2)?'select':null,
    name: 'database',
    message: 'Database',
    choices: [{
      title: 'none',
      description: 'nothing?',
      value: 'none'
    },{
      title: 'sequelize (sqlite3)',
      description: 'SQL client - in file',
      value: 'sqlite'
    },{
      title: 'sequelize (mySQL)',
      description: 'SQL client - on server',
      value: 'mysql'
    },{
      title: 'mongoose',
      description: 'mongoDB database - on server',
      value: 'mongoose'
    }]
  },{
    type: (_:any)=>default_option(3)?'select':null,
    name: 'format',
    message: 'Formatter',
    choices: [{
      title: 'ESLint',
      description: 'code linter',
      value: 'eslint'
    },{
      title: 'Prettier',
      description: 'code formatter',
      value: 'prettier'
    },{
      title: 'Prettier + ESLint',
      description: 'code formatter & code linter',
      value: 'prettier+eslint'
    }]
  },{
    type: (_:any)=>default_option(4)?'select':null,
    name: 'manager',
    message: 'Package manager',
    choices: [{
      title: 'yarn',
      description: 'default - less people',
      value: 'yarn'
    },{
      title: 'npm',
      description: 'more people',
      value: 'npm'
    }]
  },{
    type: (_:any)=>default_option(5)?'text':null,
    name: 'other',
    message: 'Other modules (seperated by ,)',
    validate: (ans: any)=>ans.split(" ,").pop()==""?'Remove the ending blank':true
  }])

  // sort options & template
  let extra_options: string[]=[];Object.values(further_questions).forEach((value: string | string[] )=>{
    if(typeof value === "object"){
      extra_options.push(...value)
    } else extra_options.push(value)
  })
  const preset_index=default_output.preset
  let template: 'basic' | 'more';

  // handle presets
  if(preset_index!=2){
    template = 'basic';
    if(preset_index>2){
      extra_options=presets[preset_index-3].tech;
    }
    if(preset_index==1){
      extra_options=["typescript"]
    }
    if(preset_index==-1){
      using_preset=false
    }
  } else {
    template = 'more'
  }

  // aths
  const new_dependencies: string[] = []
  const dir = process.env.PWD as string;
  const to_path = `${dir}/${default_output.name}`

  // spinners & templates
  console.log(``)
  const spinner_package = new Spinner(`%s Copying template`)
  spinner_package.setSpinnerString(spinner_string)
  spinner_package.start()
  await copy_folder(join(__dirname, `../templates/${template}`), to_path)
  spinner_package.stop()
  console.log(``)
  const spinner_extra = new Spinner(`%s Adding presets`)
  spinner_extra.setSpinnerString(spinner_string)
  spinner_extra.start()

  // options
  for ( const option of extra_options ) {

    // path & checkes
    const option_path = join(__dirname, `../changes/+${option}`)
    if(existsSync(option_path)){

      // paths
      const add_path = join(option_path, `+`)
      const edit_path = join(option_path, `=`)
      const delete_path = join(option_path, `-`)

      // dep. and srp.
      const package_json = JSON.parse(readFileSync(join(__dirname, `../templates/${template}/package.json`)).toString('utf8'))
      const dependencies = JSON.parse(readFileSync(join(option_path, `dependencies.json`)).toString('utf8'))
      const scripts = JSON.parse(readFileSync(join(option_path, `scripts.json`)).toString('utf8'))
      const new_dependencies = { ...package_json.devDependencies, ...dependencies }
      const new_scripts = { ...package_json.scripts, ...scripts }
      package_json.devDependencies = new_dependencies
      package_json.scripts = new_scripts
      writeFileSync(join(to_path, `package.json`), format(package_json, {
        tabWidth: 2,
        useTabs: true
      }))

      // additions
      if(existsSync(add_path)){
        await copy_folder(add_path, to_path)
      }

      // edits
      if(existsSync(edit_path)){
        await copy_folder(edit_path, to_path)
      }
      // deletes
      if(existsSync(delete_path)){
        await delete_items(delete_path, to_path)
      }
    }else{
      new_dependencies.push(...option.split(","))
    }
  }
  spinner_extra.stop()
  console.log(``)

  // installing & finish text
  const further_questions_any = further_questions as Answers<any>
  const package_manager = further_questions!={} ? further_questions_any.manager ? further_questions_any.manager : `yarn` : `yarn`
  const spinner_node = new Spinner(`%s Installing node modules`)
  spinner_node.setSpinnerString(spinner_string)
  spinner_node.start()
  for ( const dependency of new_dependencies ) {
    try{await exec(`cd ${to_path}
    ${package_manager}${package_manager==`npm` ? ` install` : ` add`} -D ${dependency}
    ${extra_options.includes(`typescript`)?``:`#`}${package_manager}${package_manager==`npm` ? ` install` : ` add`} -D @types/${dependency}`)}
    catch(e){}
  }
  try{await exec(`cd ${to_path}
  ${package_manager}${package_manager==`npm` ? ` install` : ``}`)}
  catch(e){console.log(`\n! There was an error installing preset node modules`)}
  spinner_node.stop()

  // save preset
  if(extra_options!=[]&&using_preset==false){
    console.log(`\n`)
    const preset_save: prompts.Answers<any> = await prompts({
      type: "confirm",
      name: "save",
      message: "Would you like to save this as a preset?",
      choices: [{
        title: "Yes",
        value: true
      },{
        title: "No",
        value: false
      }]
    })
    if(preset_save.save){
      const preset_data: prompts.Answers<any> = await prompts([{
        type: "text",
        name: "name",
        message: "Enter the preset title",
        validate: (text: string) => text!=''
      },{
        type: "text",
        name: "description",
        message: "Enter the preset description"
      }])
      const preset: Preset = {
        name: preset_data.name,
        description: preset_data.description,
        tech: extra_options
      }
      presets.push(preset)
      writeFileSync(presets_path, JSON.stringify(presets))
    }
  }else{console.log(``)}

  console.log(`
  Next Steps

  1. cd ${default_output.name}
  2. ${package_manager==`npm`?`npm run`:`yarn`} dev --open
  `)
}
main();