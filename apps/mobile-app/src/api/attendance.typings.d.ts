declare namespace API {
  type CheckInParams = {
    location: string;
    mood?: string;
  };

  type CheckInResult = {
    blindBox: string;
    signTime: string;
  };
}
