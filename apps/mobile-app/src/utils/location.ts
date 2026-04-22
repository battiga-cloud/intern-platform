export interface LocationInfo {
  latitude: number;
  longitude: number;
  address?: string; // 如果后续接入逆地址解析
}

/**
 * 获取当前位置封装
 * @param type 坐标系类型，默认为 gcj02 (国测局坐标，适用于腾讯/高德地图)
 */
export const getSafeLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    // 微信小程序端先检查授权状态
    uni.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userLocation"] === false) {
          // 用户之前拒绝过授权，引导去设置页
          uni.showModal({
            title: "提示",
            content: "需要获取您的地理位置才能完成签到，请前往设置开启",
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting();
              }
            },
          });
          reject(new Error("USER_DENIED_LOCATION"));
        } else {
          executeGetLocation(resolve, reject);
        }
      },
    });
    // #endif

    // #ifndef MP-WEIXIN
    // H5 或其他平台直接调用
    executeGetLocation(resolve, reject);
    // #endif
  });
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const executeGetLocation = (resolve: Function, reject: Function) => {
  uni.getLocation({
    type: "gcj02",
    isHighAccuracy: true, // 开启高精度定位
    success: (res) => {
      resolve({
        latitude: res.latitude,
        longitude: res.longitude,
      });
    },
    fail: (err) => {
      console.error("定位失败：", err);
      uni.showToast({
        title: "获取位置失败",
        icon: "none",
      });
      reject(err);
    },
  });
};
