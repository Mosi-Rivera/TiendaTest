let sizes_arr;
const sizes = Object.create({
    XS: "XS",
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    getArr() {return sizes_arr;}
});
sizes_arr = Object.values(sizes);
module.exports = sizes;