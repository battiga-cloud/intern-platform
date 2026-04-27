declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      accessToken: string;
      refreshToken: string;
    }

    interface UserInfo {
      id: string;
      account: string;
      name?: string;
      phone?: string;
      roles: string[];
      buttons: string[];
    }
  }
}
