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
    belt?: 'white' | 'blue' | 'purple' | 'brown' | 'black'
    grade?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    attendanceCount?: number
    avatar?: string
    birthdate?: string
    role: Array<'admin' | 'coach' | 'member'>
}

export interface Attendance extends Collection {
    user: string
    expand?: {
        user: User
    }
}