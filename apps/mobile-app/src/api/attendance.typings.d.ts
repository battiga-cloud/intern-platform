declare namespace API {
  interface CheckInParams {
    location: string
    mood?: string
  };

  interface CheckInResult {
    blindBox: string
    signTime: string
  };
}
