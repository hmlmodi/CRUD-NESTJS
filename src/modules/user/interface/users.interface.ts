import { Document } from 'mongoose';
export interface ISUser extends Document{
    readonly name: string;
    readonly email: string;
    readonly mobileNumber: number;
    readonly password: string;
}