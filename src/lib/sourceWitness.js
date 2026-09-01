// Source-critical witness layer for the Living Grimoire.
// These are deliberately short normalized Latin incipits, not diplomatic
// transcriptions. The 1564 facsimile remains the authority for spelling,
// capitalization, typography, figures, spacing, and marginal detail.

export const SOURCE_EDITION = Object.freeze({
  author: 'Ioannes Dee Londinensis',
  title: 'Monas Hieroglyphica',
  place: 'Antwerp',
  printer: 'G. Silvius, Typographus Regius',
  year: 1564,
  lccn: '11023473',
  facsimileUrl: 'https://tile.loc.gov/storage-services/service/rbc/rbc0001/2009/2009fabyan23473/2009fabyan23473.pdf',
  catalogueUrl: 'https://www.loc.gov/item/11023473/',
  translationReferenceUrl: 'https://www.esotericarchives.com/dee/monad.htm',
  translationReference: 'J. W. Hamilton-Jones (1947); compare C. H. Josten (1964)',
});

const LATIN_INCIPITS = Object.freeze({
  1: 'Per lineam rectam, circulumque, prima simplicissimaque fuit rerum…',
  2: 'At nec sine recta circulus, nec sine puncto recta artificiose fieri potest…',
  3: 'Monadis igitur hieroglyphicae conspicuum centrale punctum terram refert…',
  4: 'Lunae hemicyclium, licet hic solari sit circulo quasi superius priusque…',
  5: 'Et lunari certe semicirculo ad solare complementum perducto…',
  6: 'Solem Lunamque rectilineae cruci inniti hic videmus…',
  7: 'Elementis, extra suas sedes naturales, dimotis…',
  8: 'Quaternarii, praeterea expansio cabalistica, secundum usitatae numerationis phrasin…',
  9: 'Hoc autem nostrae Monadis, Soli Lunaeque, optime convenire videbitur…',
  10: 'Dodecatemorii Arietis, omnibus est notissima…',
  11: 'Arietis nota mystica, ex duobus semicirculis in communi puncto connexis…',
  12: 'Antiquissimi sapientes Magi, quinque planetarum nobis tradidere notas hieroglyphicas…',
  13: 'Martis ergo character mysticus, an non ex Solis et Arietis hieroglyphicis est conflatus…',
  14: 'Ex Sole et Luna, totum hoc pendere magisterium iam clare confirmatum est…',
  15: 'Solis proinde Lunaeque circa terram labores philosophis proponimus considerandos…',
  16: 'Iam nobis de Cruce, paucis, ad nostrum propositum est philosophandum…',
  17: 'Ut ex sexto theoremate liquere potest, in Cruce nostra quatuor rectos considerari angulos…',
  18: 'Ex duodecimo et decimotertio theorematibus nostris colligi potest…',
  19: 'Quod Sol et Luna, omnibus ceteris planetis, longe fortius…',
  20: 'Licet satis bona ratione hieroglyphica supra demonstravimus…',
  21: 'Si, quod in nostrae Monadis recessibus interius latebat involutum…',
  22: 'Nondum nostrae Monadis esse exhausta mysteria facile liquebit…',
  23: 'Symmetrias iam in nostrae Monadis constructione hieroglyphica a nobis observatas…',
  24: 'Ut nostrum huius libelli exordium a puncto, recta, circuloque coepimus…',
});

export const sourceWitnessTheoremIds = Object.freeze(
  Object.keys(LATIN_INCIPITS).map(Number),
);

export function getSourceWitness(theoremId) {
  const id = Math.max(1, Math.min(24, Number(theoremId) || 1));
  return {
    theoremId: id,
    latinIncipit: LATIN_INCIPITS[id],
    transcriptionNote:
      'Normalized Latin incipit from the 1564 Antwerp witness. Consult the facsimile for original typography, diagrams, capitalization, spelling, and spacing.',
    englishLabel: 'English reading · project text',
    ...SOURCE_EDITION,
  };
}
