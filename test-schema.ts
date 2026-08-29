export interface HubAlly {
  id: string;
  ally_name: string;
  business_type: string;
  description: string;
  logo_or_photo: string;
  contact_info: any;
  external_link: string;
  referral_code: string;
  status: string;
  date_added: string;
}

export interface HubTenant {
  id: string;
  tenant_name: string;
  description: string;
  category: string;
  photos: string[];
  contact_info: any;
  invoicing_enabled: boolean;
  referral_code: string;
  pixel_id: string;
  status: string;
  date_added: string;
}
