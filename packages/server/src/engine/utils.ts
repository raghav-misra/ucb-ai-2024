export const randInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export const nameToID = (name: string) => {
    return name.trim().toLowerCase().replaceAll(' ', '_')
}

export const idToName = (id: string) => {
    return id.trim().toLowerCase()
        //titleCase
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function injectSeed<T>(item: T) {
    const seed = Math.floor(Math.random() * 100000000)
    //@ts-ignore
    item.seed = seed
    return item as T & { seed: number }
}

