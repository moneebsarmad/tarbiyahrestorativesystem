import type { AnchorType, IslamicAnchorRow, SubValueKey } from "@/types";

export interface IslamicAnchorSeedItem
  extends Omit<
    IslamicAnchorRow,
    "id" | "created_at" | "updated_at" | "created_by" | "discussion_questions"
  > {
  discussion_questions: string[];
}

function buildAnchor(
  subValue: SubValueKey,
  source: string,
  arabicText: string,
  transliteration: string,
  translation: string,
  discussionQuestions: string[],
  anchorType: AnchorType = "ayah"
): IslamicAnchorSeedItem {
  return {
    sub_value: subValue,
    anchor_type: anchorType,
    arabic_text: arabicText,
    transliteration,
    translation,
    source,
    discussion_questions: discussionQuestions,
    is_system_default: true,
    is_active: true
  };
}

export const ISLAMIC_ANCHOR_SEED: readonly IslamicAnchorSeedItem[] = [
  buildAnchor(
    "taqwa",
    "Al-Baqarah 2:197",
    "وَتَزَوَّدُوا۟ فَإِنَّ خَيْرَ ٱلزَّادِ ٱلتَّقْوَىٰ",
    "Wa tazawwadu fa-inna khayra az-zadi at-taqwa",
    "Prepare yourself well; the best provision is taqwa.",
    [
      "What would it look like to carry taqwa with you before the next hard moment?",
      "How could God-consciousness change the choice you are about to make?"
    ]
  ),
  buildAnchor(
    "taqwa",
    "Al-Hujurat 49:13",
    "إِنَّ أَكْرَمَكُمْ عِندَ ٱللَّهِ أَتْقَىٰكُمْ",
    "Inna akramakum inda Allahi atqakum",
    "The most honored before Allah are the ones with the deepest taqwa.",
    [
      "When people look at status, what does Allah look at instead?",
      "How can you measure honor by taqwa rather than by attention, popularity, or power?"
    ]
  ),
  buildAnchor(
    "sidq",
    "At-Tawbah 9:119",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَكُونُوا۟ مَعَ ٱلصَّـٰدِقِينَ",
    "Ya ayyuha alladhina amanu ittaqu Allaha wa kunu maʿa as-sadiqin",
    "Believers are told to stay mindful of Allah and keep company with the truthful.",
    [
      "What truth needs to be spoken clearly in this situation?",
      "Who are the truthful people you can stand with instead of hiding or pretending?"
    ]
  ),
  buildAnchor(
    "sidq",
    "Al-Ahzab 33:70",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ ٱللَّهَ وَقُولُوا۟ قَوْلًۭا سَدِيدًۭا",
    "Ya ayyuha alladhina amanu ittaqu Allaha wa qulu qawlan sadida",
    "Believers are commanded to speak words that are straight, sound, and truthful.",
    [
      "What would a straight and truthful version of your story sound like?",
      "How can honest words repair what exaggeration or hiding has damaged?"
    ]
  ),
  buildAnchor(
    "iffah",
    "An-Nur 24:30",
    "قُل لِّلْمُؤْمِنِينَ يَغُضُّوا۟ مِنْ أَبْصَـٰرِهِمْ وَيَحْفَظُوا۟ فُرُوجَهُمْ",
    "Qul lil-muʾminina yaghuddu min absarihim wa yahfazu furujahum",
    "Believing men are told to lower their gaze and guard their chastity.",
    [
      "What boundary should have stopped this action sooner?",
      "How can lowering the gaze protect your heart before behavior goes further?"
    ]
  ),
  buildAnchor(
    "iffah",
    "An-Nur 24:31",
    "وَقُل لِّلْمُؤْمِنَـٰتِ يَغْضُضْنَ مِنْ أَبْصَـٰرِهِنَّ وَيَحْفَظْنَ فُرُوجَهُنَّ",
    "Wa qul lil-muʾminati yaghdudna min absarihinna wa yahfazna furujahunna",
    "Believing women are told to lower their gaze and guard their chastity.",
    [
      "What is one practical boundary that helps you protect your dignity?",
      "How can modest choices give you more strength rather than less?"
    ]
  ),
  buildAnchor(
    "taharah",
    "Al-Baqarah 2:222",
    "إِنَّ ٱللَّهَ يُحِبُّ ٱلتَّوَّٰبِينَ وَيُحِبُّ ٱلْمُتَطَهِّرِينَ",
    "Inna Allaha yuhibbu at-tawwabina wa yuhibbu al-mutatahhirin",
    "Allah loves those who keep returning in repentance and those who purify themselves.",
    [
      "Where do you need both tawbah and purification in this situation?",
      "How can cleaning up a mess become part of your repentance?"
    ]
  ),
  buildAnchor(
    "taharah",
    "Al-Muddaththir 74:4",
    "وَثِيَابَكَ فَطَهِّرْ",
    "Wa thiyabaka fatahhir",
    "Purify your garments and keep your outward state clean.",
    [
      "What does outward cleanliness say about your inward state right now?",
      "How can caring for shared spaces become part of your worship?"
    ]
  ),
  buildAnchor(
    "hilm",
    "Ali 'Imran 3:134",
    "وَٱلْكَـٰظِمِينَ ٱلْغَيْظَ وَٱلْعَافِينَ عَنِ ٱلنَّاسِ",
    "Wal-kazimina al-ghayza wal-ʿafina ʿan an-nas",
    "The people of excellence are those who restrain anger and pardon others.",
    [
      "What did your anger want to do, and what did Allah ask you to do instead?",
      "How could restraint have changed the outcome of the moment?"
    ]
  ),
  buildAnchor(
    "hilm",
    "Fussilat 41:34",
    "ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ",
    "Idfaʿ billati hiya ahsan",
    "Push back harm with what is better.",
    [
      "What would responding with what is better have looked like here?",
      "How can calm strength be more powerful than retaliation?"
    ]
  ),
  buildAnchor(
    "riayah",
    "Ad-Duhaa 93:9",
    "فَأَمَّا ٱلْيَتِيمَ فَلَا تَقْهَرْ",
    "Fa amma al-yatima fala taqhar",
    "Do not oppress the orphan or the vulnerable one.",
    [
      "Who was more vulnerable than you in this situation?",
      "What does care look like when someone has less power than you?"
    ]
  ),
  buildAnchor(
    "riayah",
    "Ad-Duhaa 93:10",
    "وَأَمَّا ٱلسَّآئِلَ فَلَا تَنْهَرْ",
    "Wa amma as-saʾila fala tanhar",
    "Do not drive away or harshly rebuke the one who asks.",
    [
      "How could you respond with care when someone needs something from you?",
      "What kind of tone shows riayah instead of dismissal?"
    ]
  ),
  buildAnchor(
    "hifz_al_huquq",
    "Al-Baqarah 2:188",
    "وَلَا تَأْكُلُوٓا۟ أَمْوَٰلَكُم بَيْنَكُم بِٱلْبَـٰطِلِ",
    "Wa la taʾkulu amwalakum baynakum bil-batil",
    "Do not take one another's wealth or rights in wrongful ways.",
    [
      "What right of another person was crossed here?",
      "What would restoring that right look like in a concrete way?"
    ]
  ),
  buildAnchor(
    "hifz_al_huquq",
    "Al-Isra 17:34",
    "وَلَا تَقْرَبُوا۟ مَالَ ٱلْيَتِيمِ إِلَّا بِٱلَّتِى هِىَ أَحْسَنُ",
    "Wa la taqrabu mala al-yatimi illa billati hiya ahsan",
    "Do not go near another person's entrusted property except in the best way.",
    [
      "How do we treat what belongs to someone else when they depend on us?",
      "What is the difference between access and permission?"
    ]
  ),
  buildAnchor(
    "adab",
    "Al-Hujurat 49:11",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا يَسْخَرْ قَوْمٌۭ مِّن قَوْمٍ",
    "Ya ayyuha alladhina amanu la yaskhar qawmun min qawm",
    "Believers are told not to ridicule one another.",
    [
      "How did words, jokes, or tone make someone feel smaller?",
      "What would adab sound like in the same conversation?"
    ]
  ),
  buildAnchor(
    "adab",
    "Al-Hujurat 49:12",
    "وَلَا يَغْتَب بَّعْضُكُم بَعْضًا",
    "Wa la yaghtab baʿdukum baʿdan",
    "Do not backbite one another.",
    [
      "Was this conversation happening with the person or about the person?",
      "How could you speak in a way that protects dignity when someone is absent?"
    ]
  ),
  buildAnchor(
    "amanah",
    "Al-Mu'minun 23:8",
    "وَٱلَّذِينَ هُمْ لِأَمَـٰنَـٰتِهِمْ وَعَهْدِهِمْ رَٰعُونَ",
    "Walladhina hum li-amanatihim wa ʿahdihim raʿun",
    "Successful believers guard their trusts and honor their covenants.",
    [
      "What trust was placed in your hands here?",
      "How do trustworthy people act when no one is watching?"
    ]
  ),
  buildAnchor(
    "amanah",
    "Al-Anfal 8:27",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ لَا تَخُونُوا۟ ٱللَّهَ وَٱلرَّسُولَ وَتَخُونُوٓا۟ أَمَـٰنَـٰتِكُمْ",
    "Ya ayyuha alladhina amanu la takhunu Allaha wa ar-rasula wa takhunu amanatikum",
    "Believers are warned not to betray their trusts knowingly.",
    [
      "Was there a trust you knew you were breaking at the time?",
      "What repair is needed after a betrayal of trust?"
    ]
  ),
  buildAnchor(
    "indibat",
    "Al-Baqarah 2:153",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ",
    "Ya ayyuha alladhina amanu istaʿinu bis-sabri was-salah",
    "Believers are told to seek help through patience and prayer.",
    [
      "When you felt resistance, what disciplined response could have grounded you?",
      "How can patience and prayer help you follow through instead of drifting?"
    ]
  ),
  buildAnchor(
    "indibat",
    "Ali 'Imran 3:200",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟",
    "Ya ayyuha alladhina amanu isbiru wa sabiru wa rabitu",
    "Believers are told to endure, persevere, and stay steady.",
    [
      "What does steadiness look like in your daily school responsibilities?",
      "Where do you need endurance instead of excuses?"
    ]
  ),
  buildAnchor(
    "iltizam",
    "Al-Ma'idah 5:1",
    "يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَوْفُوا۟ بِٱلْعُقُودِ",
    "Ya ayyuha alladhina amanu awfu bil-ʿuqud",
    "Believers are told to fulfill their commitments.",
    [
      "What commitment did you already agree to before this happened?",
      "How can keeping small commitments train you for bigger ones?"
    ]
  ),
  buildAnchor(
    "iltizam",
    "Al-Isra 17:34",
    "وَأَوْفُوا۟ بِٱلْعَهْدِ ۖ إِنَّ ٱلْعَهْدَ كَانَ مَسْـُٔولًۭا",
    "Wa awfu bil-ʿahdi inna al-ʿahda kana masʾula",
    "Honor your pledge, because every pledge will be asked about.",
    [
      "If Allah asks you about this commitment, what answer do you want to give?",
      "What follow-through is still owed after your words were given?"
    ]
  ),
  buildAnchor(
    "muraqabah",
    "Qaf 50:18",
    "مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌۭ",
    "Ma yalfizu min qawlin illa ladayhi raqibun ʿatid",
    "Not a single word is spoken except that it is being recorded.",
    [
      "How might your speech change if you remembered it is being recorded?",
      "What patterns show up when you stop and notice your words in real time?"
    ]
  ),
  buildAnchor(
    "muraqabah",
    "Al-'Alaq 96:14",
    "أَلَمْ يَعْلَم بِأَنَّ ٱللَّهَ يَرَىٰ",
    "Alam yaʿlam bi-anna Allaha yara",
    "Does the person not know that Allah sees?",
    [
      "What would have changed if you had remembered that Allah sees this moment?",
      "How can awareness of Allah help you pause before the next decision?"
    ]
  )
] as const;

export const ANCHORS_BY_SUB_VALUE = Object.fromEntries(
  Array.from(new Set(ISLAMIC_ANCHOR_SEED.map((anchor) => anchor.sub_value))).map((subValue) => [
    subValue,
    ISLAMIC_ANCHOR_SEED.filter((anchor) => anchor.sub_value === subValue)
  ])
) as Record<SubValueKey, IslamicAnchorSeedItem[]>;
