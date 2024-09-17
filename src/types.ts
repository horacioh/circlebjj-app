export interface Collection {
    id: string
    created: string
    updated: string
}

export interface User extends Collection {
    username: string
    first_name: string
    last_name: string
    email: string
    verified : string
    belt?: string
    grade?: string
    attendanceCount?: number
    avatar?: string
}

export interface Attendance extends Collection {
    user: string
    expand?: {
        user: User
    }
}