import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'The first name of the user', example: 'israel' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ description: 'The last name of the user', example: 'Israeli' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ description: 'The email address of the user', example: 'israel.Israeli@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'Aa123456', minLength: 6 })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
