import { join } from 'node:path';
import { readdir, mkdir, lstat, writeFile, readFile, rm } from "fs/promises";
export async function copy_folder(from: string, to: string) {
  try{await mkdir(to)}catch(e){}
  const folder_files: string[] = await readdir(from);
  const next_folders: {from:string, to:string}[] = [];
  for ( const folder of folder_files ) {
    const item_path = join(from, folder)
    const file_data = await lstat(item_path);
    if (file_data.isDirectory()) next_folders.push({
      from: `${from}/${item_path.split("/").pop()}`,
      to: `${to}/${item_path.split("/").pop()}`
    })
    else await writeFile(
      `${to}/${item_path.split("/").pop()}`,
      await readFile(`${from}/${item_path.split("/").pop()}`)
    )
  }
  for ( const folder of next_folders ) {
    await copy_folder(folder.from, folder.to)
  } return;
}
export async function delete_items(from: string, to: string, candeleteroot=false) {
  const folder_files: string[] = await readdir(from);
  if (folder_files.length==0 && candeleteroot) {
    await rm(to, { recursive: true }); return;
  }
  const next_folders: {from:string, to:string}[] = [];
  for ( const folder of folder_files ) {
    const item_path = join(from, folder)
    const file_data = await lstat(item_path);
    if (file_data.isDirectory()) if ((await readdir(item_path)).length==0) await rm(
      `${to}/${item_path.split("/").pop()}`,
      { recursive: true }
    )
    else next_folders.push({
      from: `${from}/${item_path.split("/").pop()}`,
      to: `${to}/${item_path.split("/").pop()}`
    })
    else await rm(
      `${to}/${item_path.split("/").pop()}`,
      { recursive: true }
    )
  }
  for ( const folder of next_folders ) {
    await delete_items(folder.from, folder.to, true)
  } return;
}