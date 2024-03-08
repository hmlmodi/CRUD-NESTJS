import * as jwt from 'jwt-simple';
import * as moment from 'moment';



export async function generateToken(user): Promise<string> {
    const { _id, name, email } = user;
    const payload = { sub: _id, name, email };
    const expiration_time = moment().add(1, 'hour').valueOf();
    const token = jwt.encode({ exp: expiration_time, id: _id }, process.env.mySecret);
    return token;
}
