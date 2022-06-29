const chat=[]
export const get = async () => {
  return {
    status: 200,
    body: {
      chat,
    }
  }
}
export const post = async ({request}) => {
  chat.push(await request.text())
  return{status:200}
}