/*
* 缓存
*/

class Cache {
  constructor() {
    this.map = new Map();
  }

  /**
   * 设置缓存
   * @param {键} key
   * @param {值} value
   * @param {存在时间} maxAge
   */
  set(key, value, maxAge) {
    let data = {
      value: value, // 值
      maxAge: 0 | maxAge, // 默认为0
      createTime: new Date().getTime() //创建时间
    };
    this.map.set(key, data);
  }

  /**
   * 根据键获取值
   * @param {键} key
   */
  get(key) {
    let data = this.map.get(key);
    if (
      data !== undefined &&
      (data.maxAge === 0 ||
        new Date().getTime() - data.createTime < data.maxAge)
    ) {
      return data.value;
    } else {
      return null;
    }
  }
}

export default Cache;
