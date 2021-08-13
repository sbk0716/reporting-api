import { Injectable } from '@nestjs/common';

/**
 * `@Injectable()`でproviderとして認識される
 * AppControllerのconstructorからDIされる
 */
@Injectable()
export class AppService {
  getStatus(): string {
    return 'I am living!';
  }
}
