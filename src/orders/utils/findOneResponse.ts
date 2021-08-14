import { IsNotEmpty, IsUUID, IsString, IsNumber } from 'class-validator';
import { FileFormatType } from '../../reports/types/report.type';

interface IConsignor {
  contractorName?: string;
}
interface IConsignee {
  contractorName?: string;
}
interface IUserPersonal {
  name?: string;
  nameKana?: string;
  zipCode?: string;
  address?: string;
  building?: string;
  phoneNumber?: string;
  birthday?: string;
  taxOffice?: string;
  workingStartDate?: string;
}
interface IUserCompany {
  name?: string;
  nameKana?: string;
  officialPosition?: string;
  ceoName?: string;
  zipCode?: string;
  address?: string;
  building?: string;
  phoneNumber?: string;
}
interface IUserBank {
  name?: string;
  code?: string;
  branchName?: string;
  branchCode?: string;
}
interface IAffiliationCompany {
  name?: string;
  nameKana?: string;
  officialPosition?: string;
  ceoName?: string;
  zipCode?: string;
  address?: string;
  building?: string;
  phoneNumber?: string;
}
interface ITaxAccount {
  name?: string;
  nameKana?: string;
  officialPosition?: string;
  ceoName?: string;
  companyName?: string;
  companyNameKana?: string;
  companyZipCode?: string;
  companyAddress?: string;
  companyBuilding?: string;
}
interface ITemplateAttributes {
  consignor?: IConsignor;
  consignee?: IConsignee;
  userPersonal?: IUserPersonal;
  userCompany?: IUserCompany;
  userBank?: IUserBank;
  affiliationCompany?: IAffiliationCompany;
  taxAccount?: ITaxAccount;
}

export class FindOneResponse {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  consoleEmail: string;

  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @IsNotEmpty()
  @IsNumber()
  ttl: string;

  @IsNotEmpty()
  formatId: FileFormatType;

  @IsNotEmpty()
  @IsString()
  templateName: string;

  templateAttributes: ITemplateAttributes;
}
