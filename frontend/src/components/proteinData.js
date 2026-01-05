export const proteinGroups = {
  "Mung bean protein": [
    "(MungBean)_8Sa-globulin_MUB2.pdb",
    "(MungBean)_8Sa-globulin_MUBRV.pdb",
    "(MungBean)_8Sa-globulin_NAGNAM.pdb",
    "(MungBean)_8Sa-globulin_SRRP5.pdb",
  ],
  "Pea protein": [
    "(Pea)_7S-globulin_MUB2.pdb",
    "(Pea)_7S-globulin_MUBRV.pdb",
    "(Pea)_7S-globulin_NAGNAM.pdb",
    "(Pea)_7S-globulin_SRRP5.pdb",
  ],
  "Soy bean protein": [
    "(Soybean)_11S-legumin_MUB2.pdb",
    "(Soybean)_11S-legumin_MUBRV.pdb",
    "(Soybean)_11S-legumin_SRRP5.pdb",
  ],
  "Whey protein": [
    "(Whey)_B-lactoglobulin_MUB2.pdb",
    "(Whey)_B-lactoglobulin_MUBRV.pdb",
    "(Whey)_B-lactoglobulin_NAGNAM.pdb",
    "(Whey)_B-lactoglobulin_SRRP5.pdb"
  ]
};

export const proteinNameMapping = {
  "(MungBean)_8Sa-globulin_MUB2.pdb": "8S-MUB2",
  "(MungBean)_8Sa-globulin_MUBRV.pdb": "8S-MUBRV",
  "(MungBean)_8Sa-globulin_NAGNAM.pdb": "8S-NAGNAM",
  "(MungBean)_8Sa-globulin_SRRP5.pdb": "8S-SRRP5",
  "(Pea)_7S-globulin_MUB2.pdb": "7S-MUB2",
  "(Pea)_7S-globulin_MUBRV.pdb": "7S-MUBRV",
  "(Pea)_7S-globulin_NAGNAM.pdb": "7S-NAGNAM",
  "(Pea)_7S-globulin_SRRP5.pdb": "7S-SRRP5",
  "(Soybean)_11S-legumin_MUB2.pdb": "11S-MUB2",
  "(Soybean)_11S-legumin_MUBRV.pdb": "11S-MUBRV",
  "(Soybean)_11S-legumin_SRRP5.pdb": "11S-SRRP5",
  "(Whey)_B-lactoglobulin_MUB2.pdb": "BLG-MUB2",
  "(Whey)_B-lactoglobulin_MUBRV.pdb": "BLG-MUBRV",
  "(Whey)_B-lactoglobulin_NAGNAM.pdb": "BLG-NAGNAM",
  "(Whey)_B-lactoglobulin_SRRP5.pdb": "BLG-SRRP5"
};

export const dockingScores = {
  "(MungBean)_8Sa-globulin_MUB2.pdb": { name: "8S-MUB2", score: -220.26 },
  "(MungBean)_8Sa-globulin_MUBRV.pdb": { name: "8S-MUBRV", score: -207.25 },
  "(MungBean)_8Sa-globulin_SRRP5.pdb": { name: "8S-SRRP5", score: -254.44 },
  "(MungBean)_8Sa-globulin_NAGNAM.pdb": { name: "8S-NAGNAM", score: -242.38 },
  "(Pea)_7S-globulin_MUB2.pdb": { name: "7S-MUB2", score: -194.65 },
  "(Pea)_7S-globulin_MUBRV.pdb": { name: "7S-MUBRV", score: -239.03 },
  "(Pea)_7S-globulin_SRRP5.pdb": { name: "7S-SRRP5", score: -208.39 },
  "(Pea)_7S-globulin_NAGNAM.pdb": { name: "7S-NAGNAM", score: -213.28 },
  "(Soybean)_11S-legumin_MUB2.pdb": { name: "11S-MUB2", score: -381.73 },
  "(Soybean)_11S-legumin_MUBRV.pdb": { name: "11S-MUBRV", score: -786.18 },
  "(Soybean)_11S-legumin_SRRP5.pdb": { name: "11S-SRRP5", score: -740.95 },
  "(Whey)_B-lactoglobulin_MUB2.pdb": { name: "BLG-MUB2", score: -181.16 },
  "(Whey)_B-lactoglobulin_MUBRV.pdb": { name: "BLG-MUBRV", score: -209.71 },
  "(Whey)_B-lactoglobulin_SRRP5.pdb": { name: "BLG-SRRP5", score: -214.95 },
  "(Whey)_B-lactoglobulin_NAGNAM.pdb": { name: "BLG-NAGNAM", score: -252.52 },
};

export const getDisplayName = (filename, shortName) => {
  let groupName = '';
  if (filename.includes('(MungBean)')) {
    groupName = 'Mung bean protein';
  } else if (filename.includes('(Pea)')) {
    groupName = 'Pea protein';
  } else if (filename.includes('(Soybean)')) {
    groupName = 'Soy bean protein';
  } else if (filename.includes('(Whey)')) {
    groupName = 'Whey protein';
  }

  // const nameParts = shortName.split('-');
  // const suffix = nameParts.length > 1 ? nameParts[1] : shortName;
  
  const suffix = shortName;

  return `${groupName} ${suffix}`;
};
