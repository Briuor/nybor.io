export const randomName = () => {
    const names = ["Paulo", "Miguel", "Jose", "Laura"]
    const name = names[Math.floor(Math.random() * names.length)]
    console.log(Math.floor(Math.random() * names.length), name)
    return name
}