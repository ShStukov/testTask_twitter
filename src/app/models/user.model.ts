export interface User {
    id: number,
    name: string,
    username: string,
    email: string,
    address: Adress,
    phone: string,
    website: string,
    company: Company
}

export interface Adress {
    street: string,
    suite: string,
    city: string,
    zipcode: string,
    geo: {
        lat: string,
        lng: string
    }
}

export interface Company {
    name: string,
    catchPhrase: string,
    bs: string
}