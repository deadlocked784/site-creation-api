export interface Entity {
    id: string | number
    name: string
    [key: string]: string | number | boolean | undefined
}