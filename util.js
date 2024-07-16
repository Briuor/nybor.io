export const randomName = () => {
    const names = ["Paulo", "Miguel", "Jose", "Laura"]
    const name = names[Math.floor(Math.random() * names.length)]
    return name
}