declare namespace API {
  interface ApiResponse<T = any> {
    code: number
    msg: string
    data: T
  }
}
