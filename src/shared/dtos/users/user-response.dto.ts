import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique UUID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'Israel',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Israeli',
  })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'Israel.Israeli@example.com',
  })
  email: string;

  @Exclude()
  password?: string;
}
