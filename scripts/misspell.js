// misspell.js
// Generate misspellings for words based on common phonetic and orthographic errors.
class MisspellingGenerator {
  constructor() {
    this.vowels = 'aeiou';
    this.consonants = 'bcdfghjklmnpqrstvwxyz';
    this.phoneticSubs = {
      // Long 'a' sound
      ai: ['ay', 'a-e', 'eigh', 'ey', 'i', 'e', 'ea', 'ei', 'a'],
      ay: ['ai', 'a-e', 'eigh', 'ey', 'i', 'e', 'ea', 'ei'],
      'a-e': ['ai', 'ay', 'eigh', 'ey', 'i', 'e', 'ea', 'ei'],
      aigh: ['ay', 'a-e', 'ey', 'eigh', 'ei', 'a', 'i', 'e'],

      // Short 'a' sound
      a: ['ah', 'ar', 'au', 'aw'],

      // Long 'e' sound
      ee: ['ea', 'ie', 'ei', 'i', 'ey', 'e', 'y'],
      ea: ['ee', 'ie', 'ei', 'i', 'ey', 'e', 'y'],
      ie: ['ee', 'ea', 'ei', 'i', 'ey', 'e', 'y'],

      // Short 'e' sound
      e: ['eh', 'ae', 'ea'],

      // Long 'i' sound
      igh: ['i', 'y', 'ie', 'ai', 'a-e'],
      i: ['igh', 'y', 'ie', 'ai', 'a-e', 'e'],
      y: ['igh', 'i', 'ie', 'ai', 'a-e'],

      // Long 'o' sound
      oa: ['ow', 'o-e', 'ou', 'oe', 'o'],
      'o-e': ['oa', 'ow', 'ou', 'oe', 'o'],
      oe: ['oa', 'o-e', 'ou', 'ow', 'o'],

      // Short 'o' sound
      o: ['au', 'aw', 'ah', 'ough'],

      // Long 'u' sound
      oo: ['ew', 'ue', 'ou', 'o', 'oe', 'ough', 'ui'],
      ew: ['oo', 'ue', 'ou', 'o', 'oe', 'ough', 'ui'],
      ue: ['oo', 'ew', 'ou', 'o', 'oe', 'ough', 'ui'],

      // Short 'u' sound
      u: ['i', 'o'],

      // Consonant sounds
      ch: ['sh', 'tch', 'k', 'ci', 'ti'],
      sh: ['ch', 'ci', 'ti', 's'],
      k: ['c', 'ck', 'q', 'qu', 'x'],
      g: ['j', 'dg', 'dge', 'gh'],
      c: ['k', 'ck', 'q', 's', 'x'],
      dg: ['g', 'dge', 'ge', 'gi', 'd'],
      dge: ['g', 'dg', 'ge', 'gi', 'd'],
      qu: ['kw', 'k', 'q'],
      tch: ['ch', 'ti', 'sh'],
      ti: ['ch', 'sh', 'ci', 'tch'],
      ci: ['ch', 'sh', 'ti', 'tch'],
      si: ['ci', 'shi', 'ce', 'sci', 'ti'],
      sci: ['ci', 'shi', 'ce', 'si'],
      shu: ['sh', 'su', 'chu'],
      ce: ['ci', 'shi', 'si', 'sci'],
      s: ['c', 'z', 'x'],

      // Diphthongs
      ow: ['ou', 'ough', 'oa', 'o', 'oe', 'ew'],
      ou: ['ow', 'ough', 'oa', 'o', 'oe', 'ew'],
      oi: ['oy', 'oy', 'oie', 'oey'],
      oy: ['oi', 'oie', 'oey'],

      // Silent letters influence
      kn: ['n'],
      wr: ['r'],
      gn: ['n'],
      mb: ['m'],
      mn: ['n'],
      pn: ['n'],
      gh: [''],
      h: [''],
      w: [''],
      b: [''],

      // Complex vowel sounds
      au: ['aw', 'ou', 'o', 'ough'],
      aw: ['au', 'ou', 'o', 'ough'],
      ough: ['ow', 'ou', 'oa', 'o', 'oe', 'ew'],

      // Miscellaneous
      ph: ['f'],
      tion: ['sion', 'cian', 'shun'],
      sion: ['tion', 'cian', 'shun'],
      x: ['ks', 'z'],
      z: ['s', 'x'],
      ur: ['er', 'ir', 'or'],
      er: ['ur', 'ir', 'or'],
      ir: ['er', 'ur', 'or'],
      or: ['er', 'ir', 'ur'],
    };
    this.silentPatterns = {
      kn: 'n', gn: 'n', wr: 'r', mb: 'm', mn: 'm', pn: 'n',
      gh: '', h: '', w: '', b: '', n: '', m: '', l: '', k: '', p: '', t: '', d: '',
      sc: 's', ps: 's', pt: 't', st: 's', ct: 't', ph: 'f', ch: 'k', th: 't', wh: 'w',
      ck: 'k', dge: 'j', tch: 'ch', gn: 'n', kn: 'n', lm: 'm', mn: 'm', mb: 'm',
      pn: 'n', ps: 's', pt: 't', st: 's', sc: 's', ct: 't', wr: 'r', rh: 'r', ngue: 'ng',
      gue: 'g', re: 'er', le: 'el', ce: 'se', ge: 'j', se: 's', te: 't', ve: 'v', ze: 'z',
      mb: 'm', ph: 'f', gh: '', ch: 'k', sh: 's', th: 't', wh: 'w', ck: 'k', dge: 'j',
      mn: 'm', kn: 'n', gn: 'n', lm: 'm', ps: 's', pt: 't', st: 's', sc: 's', ct: 't',
      wr: 'r', rh: 'r', ngue: 'ng', gue: 'g', re: 'er', le: 'el', ce: 'se', ge: 'j', se: 's',
      bt: 't', dt: 't', ft: 't', gt: 't', kt: 't', lt: 't', mt: 't', nt: 't', pt: 't',
      tch: 'ch', xt: 't', bb: 'b', cb: 'b', db: 'b', fb: 'b', gb: 'b', kb: 'b', lb: 'b',
      u: 'i', o: 'a', i: 'e', a: 'e', e: 'i', y: 'i', c: 's', s: 'c', z: 's', t: 'd',
    };
    this.commonMistakes = {
      ie: 'ei', ei: 'ie',
      ceed: 'cede', sede: 'ceed',
      ant: 'ent', ent: 'ant',
      ance: 'ence', ence: 'ance',
      able: 'ible', ible: 'able',
      oose: 'ose', ose: 'oose', oos: 'oose', ooze: 'ose', oze: 'oose', ooz: 'ose',
      ise: 'ize', ize: 'ise', ice: 'isz',
      ism: 'izm', izm: 'ism',
      ian: 'ion', ion: 'ian',
      ior: 'er', er: 'ior',
      ious: 'eous', eous: 'ious',
      iest: 'est', est: 'iest',
      ied: 'ed', ed: 'ied',
      ier: 'er', er: 'ier',
      ence: 'ance', ance: 'ence',
      en: 'an', an: 'en',
      eous: 'ious', ious: 'eous',
      eed: 'ed', ed: 'eed',
      re: 'er', er: 're',
      le: 'el', el: 'le',
      ce: 'se', se: 'ce',
      ge: 'j', j: 'ge',
      te: 't', t: 'te',
      ve: 'v', v: 've',
      ze: 'z', z: 'ze',
      y: 'ie', ie: 'y',
      ough: 'o', o: 'ough',
    };
    this.prefixes = [
      'mis', 'dis', 'un', 'in', 'im', 'il', 'ir', 'non', 'over', 'under', 
      'sub', 'super', 'semi', 'pre', 'post', 'anti', 'de', 're', 'fore', 
      'mid', 'out', 'extra', 'hyper', 'ultra', 'auto', 'bi', 'co', 'ex', 
      'inter', 'macro', 'micro', 'mono', 'multi', 'neo', 'poly', 'pro', 'tele'
    ];
    
    this.suffixes = [
      'able', 'ible', 'ful', 'less', 'ness', 'ly', 'y', 'al', 'ous', 
      'tion', 'sion', 'ment', 'ity', 'ify', 'ize', 'ise', 'en', 'ify', 
      'ate', 'en', 'ify', 'fy', 'er', 'or', 'ar', 'ist', 'ic', 'al', 
      'ive', 'ous', 'ful', 'less', 'ly', 'y', 'ed', 'ing', 'es', 's', 
      'er', 'est', 'en'
    ];
  }

  generateMisspellings(word, n = 10) {
    console.log("\nMisspelling: " + word);
    let misspellings = new Set();

    const phoneticForm = this.generatePhoneticRepresentation(word);
    console.log(`Phonetic form of '${word}': ${phoneticForm}`);
    
    const phoneticMisspellings = this.phoneticSubstitutions(phoneticForm);
    console.log(`Phonetic misspellings: ${JSON.stringify([...phoneticMisspellings])}`);
    const originalMisspellings = this.phoneticSubstitutions(word);
    console.log(`Original misspellings: ${JSON.stringify([...originalMisspellings])}`);
    misspellings = new Set([...phoneticMisspellings, ...originalMisspellings]);
    
    const silentOmissions = this.silentLetterOmissions(word);
    console.log(`Silent omissions: ${JSON.stringify([...silentOmissions])}`);
    misspellings = new Set([...misspellings, ...silentOmissions]);
    
    misspellings = this.filterImplausibleMisspellings(misspellings, word);
    console.log(`Filtered misspellings: ${JSON.stringify([...misspellings])}`);
    misspellings = [...misspellings].filter(m => m !== word);
    
    misspellings = this.filterUnusualCombinations(misspellings);
    console.log(`Filtered unusual combinations: ${JSON.stringify([...misspellings])}`);
    const scoredMisspellings = misspellings.map(m => [m, this.plausibilityScore(word, m)]);
    scoredMisspellings.sort((a, b) => b[1] - a[1]);

    return scoredMisspellings.slice(0, n).map(([m]) => m);
  }

  phoneticSubstitutions(word) {
    const result = new Set();
    for (const [sound, replacements] of Object.entries(this.phoneticSubs)) {
      if (word.includes(sound)) {
        for (const replacement of replacements) {
          let partialReplacement = word;
          let index = partialReplacement.indexOf(sound);
          while (index !== -1) {
            partialReplacement = partialReplacement.substring(0, index) + replacement + partialReplacement.substring(index + sound.length);
            result.add(partialReplacement);
            index = partialReplacement.indexOf(sound, index + replacement.length);
          }
        }
      }
    }
    return result;
  }

  generateVariations(word, sound, replacement) {
    const variations = [];
    const indices = [];
    let index = word.indexOf(sound);
    while (index !== -1) {
      indices.push(index);
      index = word.indexOf(sound, index + 1);
    }
    
    for (let i = 1; i < (1 << indices.length); i++) {
      let variation = word;
      for (let j = 0; j < indices.length; j++) {
        if (i & (1 << j)) {
          variation = variation.substring(0, indices[j]) + replacement + variation.substring(indices[j] + sound.length);
        }
      }
      variations.push(variation);
    }
    
    return variations;
  }

  generatePhoneticRepresentation(word) {
    const phoneticMap = {
      'ph': 'f', 'gh': 'f', 'ck': 'k', 'ci': 'si', 'ce': 'se', 'cy': 'sy',
      'ch': 'ch', 'sh': 'sh', 'th': 'th', 'tion': 'shun', 'sion': 'zhun',
      'dge': 'j', 'ge': 'j', 'gi': 'j', 'gy': 'j', 'gn': 'n', 'kn': 'n',
      'wh': 'w', 'wr': 'r', 'qu': 'kw', 'x': 'ks', 'y': 'i', 'oo': 'u',
      'ou': 'ow', 'ow': 'ow', 'ea': 'ee', 'ie': 'ee', 'ei': 'ay', 'ai': 'ay',
      'ay': 'ay', 'oi': 'oy', 'oy': 'oy', 'au': 'aw', 'aw': 'aw',
      'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
      'b': 'b', 'd': 'd', 'f': 'f', 'g': 'g', 'h': 'h', 'j': 'j', 'k': 'k',
      'l': 'l', 'm': 'm', 'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't',
      'v': 'v', 'w': 'w', 'z': 'z'
    };
    let phoneticWord = word.toLowerCase();
    for (const [key, value] of Object.entries(phoneticMap)) {
      phoneticWord = phoneticWord.replace(new RegExp(key, 'g'), value);
    }
    return phoneticWord;
  }

  silentLetterOmissions(word) {
    const result = new Set();
    for (const [pattern, replacement] of Object.entries(this.silentPatterns)) {
      if (word.includes(pattern)) {
        result.add(word.replace(new RegExp(pattern, 'g'), replacement));
      }
    }
    return result;
  }

  commonMistakeSubstitutions(word) {
    const result = new Set();
    for (const [mistake, correction] of Object.entries(this.commonMistakes)) {
      if (word.includes(mistake)) {
        result.add(word.replace(new RegExp(mistake, 'g'), correction));
      }
    }
    return result;
  }

  filterImplausibleMisspellings(misspellings, original) {
    return new Set([...misspellings].filter(misspelling => {
      if (!misspelling || misspelling.length < 2 || misspelling === original) return false;
      if (misspelling[0] !== original[0] || misspelling[misspelling.length - 1] !== original[original.length - 1]) return false;
      // if (!this.plausibleConsonantPatterns(misspelling)) return false;
      // Additional checks for common patterns and phonetic plausibility
      // return this.isPhoneticallySimilar(misspelling, original);
      return true;
    }));
  }

  plausibleConsonantPatterns(word) {
    for (let i = 0; i < word.length - 2; i++) {
      if (this.consonants.includes(word[i]) &&
          word[i] === word[i + 1] &&
          word[i] === word[i + 2]) {
        return false;
      }
    }
    return true;
  }

  filterUnusualCombinations(misspellings) {
    const unusualCombinations = ['jq', 'qj', 'vx', 'xv', 'zx', 'xz', 'fq', 'qf', 'qv', 'vq', 'qz', 'zq', 'ckh', 'qh'];
    return misspellings.filter(word => 
      !unusualCombinations.some(combo => word.toLowerCase().includes(combo))
    );
  }

  plausibilityScore(original, misspelled) {
    let score = 10 - this.levenshteinDistance(original, misspelled);
    if (misspelled.length === original.length) score += 1;
    if (Math.abs(misspelled.length - original.length) === 1) score += 1;
    if (Object.keys(this.phoneticSubs).some(sound => misspelled.includes(sound))) score += 2;
    if (Object.keys(this.silentPatterns).some(pattern => misspelled.includes(pattern))) score += 1;
    if (Object.keys(this.commonMistakes).some(mistake => misspelled.includes(mistake))) score += 3;
    // Add additional scoring criteria
    if (misspelled.startsWith(original.substring(0, 2))) score += 1;
    if (misspelled.endsWith(original.substring(original.length - 2))) score += 1;
    return Math.max(score, 0);
  }

  levenshteinDistance(s1, s2) {
    if (s1.length < s2.length) return this.levenshteinDistance(s2, s1);
    if (s2.length === 0) return s1.length;
    let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
    for (let i = 0; i < s1.length; i++) {
      let currentRow = [i + 1];
      for (let j = 0; j < s2.length; j++) {
        const insertions = previousRow[j + 1] + 1;
        const deletions = currentRow[j] + 1;
        const substitutions = previousRow[j] + (s1[i] !== s2[j]);
        currentRow.push(Math.min(insertions, deletions, substitutions));
      }
      previousRow = currentRow;
    }
    return previousRow[previousRow.length - 1];
  }

  isPhoneticallySimilar(misspelling, originalSound) {
    const conditions = {
      'ci': 'ci', 'tion': 'tion', 'sion': 'sion', 'ch': 'ch', 'ph': 'f',
      'dge': 'g', 'sh': 'sh', 'ti': 'ti', 'si': 'si', 'sci': 'sci',
      'shu': 'shu', 'ce': 'ce', 's': 's', 'x': 'x',
    };
  
    const requiredSound = conditions[originalSound];
    if (requiredSound && !misspelling.includes(requiredSound)) {
      return false;
    }
  
    return true;
  }

  affixMistakes(word) {
    const result = new Set();
    for (const prefix of this.prefixes) {
      if (word.startsWith(prefix)) {
        result.add(word.slice(prefix.length));
        result.add(prefix + prefix[prefix.length - 1] + word.slice(prefix.length));
      }
    }
    for (const suffix of this.suffixes) {
      if (word.endsWith(suffix)) {
        result.add(word.slice(0, -suffix.length));
        if (['able', 'ible'].includes(suffix)) {
          result.add(word.slice(0, -suffix.length) + (suffix === 'able' ? 'ible' : 'able'));
        }
      }
    }
    return result;
  }

  generatePartMisspellings(word) {
    const misspellings = new Set();
    misspellings.add(...this.phoneticSubstitutions(word));
    misspellings.add(...this.silentLetterOmissions(word));
    misspellings.add(...this.affixMistakes(word));
    misspellings.add(...this.commonMistakeSubstitutions(word));
    return misspellings;
  }

  recombineParts(parts, misspellings) {
    const recombined = new Set();
    for (const misspelling of misspellings) {
      for (let i = 0; i < parts.length; i++) {
        if (misspelling !== parts[i]) {
          const newParts = [...parts];
          newParts[i] = misspelling;
          recombined.add(newParts.join("'"));
          recombined.add(newParts.join("-"));
          recombined.add(newParts.join(" "));
        }
      }
    }
    return recombined;
  }
}

// Example usage:
const generator = new MisspellingGenerator();
// const words = ['almost', 'lady', 'tiny', 'city', 'church'];
const words = ['church']
words.forEach(word => {
  const misspellings = generator.generateMisspellings(word, 5);
  console.log(`Misspellings for '${word}': ${JSON.stringify(misspellings)}`);
});