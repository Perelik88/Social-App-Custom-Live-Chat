export interface Member {
    id: string;
    dateOfBirth: string;
    displayName: string;
    imageUrl?: string;
    created: string;
    lastActive: string;
    gender: string;
    bio?: string;
    city: string;
    country: string;
}

export interface MemberEdit {
    displayName: string;
    bio?: string;
    city: string;
    country: string;
}

export class MemberParams {
    gender?: string;
    minAge: number = 18;
    maxAge: number = 99;
    pageNumber: number = 1;
    pageSize: number = 10;
    orderBy: string = 'lastActive';
}
