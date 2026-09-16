const BUBBLES = [0, 1, 2, 3, 4, 5].map((i) => ({
  id: i,
  size: 120 + i * 14,
  left: 40 + i * 58,
  top: 120 + i * 96,
  delay: (i * 0.4).toFixed(1),
  duration: (5 + i * 0.35).toFixed(2),
}));

Page({
  data: {
    // 有真实背景图时传入 bgSrc，玻璃会取背景做二次模糊，质感更接近原生
    bgSrc: '',
    bubbles: BUBBLES,
  },

  onFav() {
    wx.showToast({ title: '收藏', icon: 'none' });
  },

  onStar() {
    wx.showToast({ title: '星标', icon: 'none' });
  },

  onShare() {
    wx.showToast({ title: '分享', icon: 'none' });
  },
});
