export const detectLighting = (imageData) => {
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (imageData.data.length / 4);
    
    if (avgBrightness < 85) return 'dark';
    if (avgBrightness > 170) return 'bright';
    return 'good';
  };

export const calculateLabValues = (r, g, b) => {
    let rgb = [r/255, g/255, b/255];
    rgb = rgb.map(v => v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92);

    const X = rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805;
    const Y = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    const Z = rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505;

    const Xn = 0.95047, Yn = 1.00000, Zn = 1.08883;
    const xyz = [X/Xn, Y/Yn, Z/Zn].map(v => 
      v > 0.008856 ? Math.pow(v, 1/3) : (7.787 * v) + 16/116
    );

    const L = (116 * xyz[1]) - 16;
    const aValue = 500 * (xyz[0] - xyz[1]);
    const bValue = 200 * (xyz[1] - xyz[2]);
    
    return { L, a: aValue, b: bValue };
};