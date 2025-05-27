import { IsNotEmpty, IsUrl } from "class-validator";

export class CreateContentDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
