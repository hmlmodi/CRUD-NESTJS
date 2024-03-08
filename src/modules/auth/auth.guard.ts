import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jwt-simple';

import { HttpStatusCodes, ResponseMessages } from '../../constant/response.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse() as Response;
    const token = request.headers.token;

    if (token) {
      try {
        var decoded = jwt.decode(token, process.env.mySecret);

        if (new Date(decoded.exp) <= new Date(Date.now())) {
          return false;
        } else {
          return true;
        }
      } catch (error) {
        response.status(HttpStatusCodes.BAD_REQUEST).send({
          status: HttpStatusCodes.BAD_REQUEST,
          message: ResponseMessages.TOKEN_EXPIRED,
        });
        return false;
      }
    } else {
      response.status(HttpStatusCodes.BAD_REQUEST).send({
        status: HttpStatusCodes.BAD_REQUEST,
        message: ResponseMessages.TOKEN_EXPIRED,
      });
      return false;
    }
  }
}

