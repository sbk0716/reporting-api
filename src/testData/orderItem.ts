const datetime = new Date();
const unixtime = datetime.getTime();
const createdAt = datetime.toISOString();
// after one week -> 1week = 604800sec
const ttl = Math.floor(unixtime / 1000) + 604800;

export const testOrderItem = {
  createdAt,
  ttl,
  orderId: '80000000-4000-4000-4000-120000000000',
  templateAttributes: {
    consignor: {
      contractorName: '株式会社サンプル 代表取締役社長 斎藤 一',
    },
    consignee: {
      contractorName: 'GOOD合同会社 代表社員 山田 太郎 太郎 太郎',
    },
    userPersonal: {
      name: '山田 太郎 太郎',
      nameKana: 'ヤマダ タロウ タロウ タロウ タロウ',
      zipCode: '164-0001',
      address: '東京都中野区中野4-3-2-1-2-3-4-1-1-1-1',
      building: 'グリーンハイツ1010101030101',
      phoneNumber: '09012345678',
      birthday: '1987-12-31',
      taxOffice: '渋谷',
      workingStartDate: '2021-04-01',
    },
    userCompany: {
      name: 'GOOD合同会社',
      nameKana: 'グッドゴウドウガイシャ',
      officialPosition: '代表社員',
      ceoName: '山田 太郎 太郎 太郎',
      zipCode: '150-0022',
      address: '東京都渋谷区代々木2-2-2-2-2-2-2-2-2-2',
      building: 'スクエア代々木ビル 2F 2F 2F 2F 2F 2F 2F',
      phoneNumber: '08044441234',
    },
    userBank: {
      name: 'みずほ銀行',
      code: '0001',
      branchName: '赤羽支店',
      branchCode: '203',
    },
    affiliationCompany: {
      name: '株式会社サンプル',
      nameKana: 'カブシキガイシャサンプル',
      officialPosition: '代表取締役社長',
      ceoName: '斎藤 一',
      zipCode: '530-0027',
      address: '大阪府大阪市北区堂山町2-2-2-2-2-2-2-2-2',
      building: 'ヒュ-ビル 2F 2F 2F 2F 2F 2F 2F',
      phoneNumber: '07012341234',
    },
    taxAccount: {
      name: '佐藤 次郎',
      nameKana: 'サトウ ジロウ',
      officialPosition: '代表取締役社長',
      ceoName: '佐藤 一郎',
      companyName: 'GOOD税理士事務所',
      companyNameKana: 'グッドゼイリシジムショ',
      companyZipCode: '104-0031',
      companyAddress: '東京都中央区１１京橋3-3-3-3-3-3-3-3',
      building: 'ビル333333333',
    },
  },
  formatId: 1,
  templateName: 'zaisekisyoumeisyo',
  consoleEmail: 'sameEmailA@gmail.com',
};
