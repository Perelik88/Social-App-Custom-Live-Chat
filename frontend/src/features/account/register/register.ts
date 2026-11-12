import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegisterCreds } from '../../../interfaces/user';
import { AccountService } from '../../../core/services/account-service';
import { TextInput } from '../../../shared/text-input/text-input';

@Component({
  imports: [ReactiveFormsModule, TextInput],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected creds = {} as RegisterCreds;
  protected credentialsForm: FormGroup;
  protected profileForm: FormGroup;
  protected steps = signal(1)
  cancelRegister = output<void>();
  protected validationErrors = signal<{ [key: string]: string }>({});

  constructor() {
    this.credentialsForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.credentialsForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialsForm.controls['confirmPassword'].updateValueAndValidity();
    });

    this.profileForm = this.fb.group({
      gender: ['male', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]]
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;
      const matchValue = parent?.get(matchTo)?.value;
      return control.value === matchValue ? null : { mismatch: true };
    };
  }

  nextStep() {
    if (this.credentialsForm.valid) {
      this.steps.update(n => n + 1);
    }
  }

  previousStep() {
    if (this.steps() > 1) {
      this.steps.update(n => n - 1);
    }
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  }

  register() {
    if (this.credentialsForm.valid && this.profileForm.valid) {
      const registrationData = {
        ...this.credentialsForm.value,
        ...this.profileForm.value
      };
      this.accountService.register(registrationData).subscribe({
        next: () => {
          this.router.navigate(['/members']);
        },
        error: err => {
          this.validationErrors.set(err);
        }
      });
    }
  }

  cancel() {
    this.credentialsForm.reset();
    this.profileForm.reset();
    this.cancelRegister.emit();
  }
}
