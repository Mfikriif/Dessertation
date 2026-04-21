const generatePrefix = (nama) => {
  const upperName = nama.toUpperCase();
  const awalan = upperName.charAt(0);
  const sisaKonsonan = upperName.slice(1).replace(/[AEIOU\s]/g, "");
  const prefix = (awalan + sisaKonsonan).substring(0, 4);
  return prefix;
};

module.exports = { generatePrefix };
