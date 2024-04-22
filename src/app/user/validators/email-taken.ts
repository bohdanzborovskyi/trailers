import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Injectable } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors } from '@angular/forms';
import {AuthService} from "../../services/auth.service";
import {delay} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AuthService) { }

  validate = async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const userExists = await this.auth.isUserExistByEmail(control.value);
    console.log(userExists)
    return userExists ? {emailTaken: userExists} : null;

  }
}
