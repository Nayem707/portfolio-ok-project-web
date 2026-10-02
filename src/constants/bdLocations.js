const THANAS_BY_DISTRICT = {
  // Dhaka division
  Dhaka: [
    "Adabor", "Badda", "Banani", "Bangshal", "Bhashantek", "Bhatara",
    "Biman Bandar", "Cantonment", "Chawkbazar", "Dakshinkhan", "Darus Salam",
    "Demra", "Dhamrai", "Dhanmondi", "Dohar", "Gendaria", "Gulshan",
    "Hatirjheel", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul",
    "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet",
    "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur", "Motijheel", "Mugda",
    "Nawabganj", "New Market", "Pallabi", "Paltan", "Ramna", "Rampura",
    "Rupnagar", "Sabujbagh", "Savar", "Shah Ali", "Shahbagh", "Shahjahanpur",
    "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon",
    "Tejgaon Industrial Area", "Turag", "Uttara East", "Uttara West",
    "Uttarkhan", "Vatara", "Wari",
  ],
  Faridpur: [
    "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar",
    "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha",
  ],
  Gazipur: [
    "Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi",
  ],
  Gopalganj: [
    "Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara",
  ],
  Kishoreganj: [
    "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj",
    "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli",
    "Pakundia", "Tarail",
  ],
  Madaripur: ["Dasar", "Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"],
  Manikganj: [
    "Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia",
    "Shivalaya", "Singair",
  ],
  Munshiganj: [
    "Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar",
    "Tongibari",
  ],
  Narayanganj: [
    "Araihazar", "Bandar", "Fatullah", "Narayanganj Sadar", "Rupganj",
    "Siddhirganj", "Sonargaon",
  ],
  Narsingdi: [
    "Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur",
  ],
  Rajbari: ["Baliakandi", "Goalanda", "Kalukhali", "Pangsha", "Rajbari Sadar"],
  Shariatpur: [
    "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira",
  ],
  Tangail: [
    "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur",
    "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar",
  ],

  // Chattogram division
  Bandarban: [
    "Alikadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari",
    "Ruma", "Thanchi",
  ],
  Brahmanbaria: [
    "Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Brahmanbaria Sadar",
    "Kasba", "Nabinagar", "Nasirnagar", "Sarail",
  ],
  Chandpur: [
    "Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua",
    "Matlab Dakshin", "Matlab Uttar", "Shahrasti",
  ],
  Chattogram: [
    "Akbar Shah", "Anwara", "Bakalia", "Bandar", "Banshkhali",
    "Bayazid Bostami", "Boalkhali", "Chandanaish", "Chandgaon", "Chawkbazar",
    "Double Mooring", "EPZ", "Fatikchhari", "Halishahar", "Hathazari",
    "Karnaphuli", "Khulshi", "Kotwali", "Lohagara", "Mirsharai", "Pahartali",
    "Panchlaish", "Patenga", "Patiya", "Rangunia", "Raozan", "Sadarghat",
    "Sandwip", "Satkania", "Sitakunda",
  ],
  "Cox's Bazar": [
    "Chakaria", "Cox's Bazar Sadar", "Eidgaon", "Kutubdia", "Maheshkhali",
    "Pekua", "Ramu", "Teknaf", "Ukhia",
  ],
  Cumilla: [
    "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram",
    "Cumilla Adarsha Sadar", "Cumilla Sadar Dakshin", "Daudkandi", "Debidwar",
    "Homna", "Laksam", "Lalmai", "Meghna", "Monohargonj", "Muradnagar",
    "Nangalkot", "Titas",
  ],
  Feni: [
    "Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram",
    "Sonagazi",
  ],
  Khagrachhari: [
    "Dighinala", "Guimara", "Khagrachhari Sadar", "Lakshmichhari",
    "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh",
  ],
  Lakshmipur: [
    "Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati",
  ],
  Noakhali: [
    "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat",
    "Noakhali Sadar", "Senbagh", "Sonaimuri", "Subarnachar",
  ],
  Rangamati: [
    "Baghaichhari", "Barkal", "Belaichhari", "Juraichhari", "Kaptai",
    "Kawkhali", "Langadu", "Naniarchar", "Rajasthali", "Rangamati Sadar",
  ],

  // Rajshahi division
  Bogura: [
    "Adamdighi", "Bogura Sadar", "Dhunat", "Dhupchanchia", "Gabtali",
    "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj",
    "Sonatala",
  ],
  "Chapai Nawabganj": [
    "Bholahat", "Chapai Nawabganj Sadar", "Gomastapur", "Nachole", "Shibganj",
  ],
  Joypurhat: ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"],
  Naogaon: [
    "Atrai", "Badalgachhi", "Dhamoirhat", "Mahadebpur", "Manda",
    "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar",
  ],
  Natore: [
    "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga",
    "Natore Sadar", "Singra",
  ],
  Pabna: [
    "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi",
    "Pabna Sadar", "Santhia", "Sujanagar",
  ],
  Rajshahi: [
    "Bagha", "Bagmara", "Boalia", "Charghat", "Durgapur", "Godagari",
    "Mohanpur", "Motihar", "Paba", "Puthia", "Rajpara", "Shah Makhdum",
    "Tanore",
  ],
  Sirajganj: [
    "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur",
    "Sirajganj Sadar", "Tarash", "Ullahpara",
  ],

  // Khulna division
  Bagerhat: [
    "Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla",
    "Morrelganj", "Rampal", "Sarankhola",
  ],
  Chuadanga: ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"],
  Jashore: [
    "Abhaynagar", "Bagherpara", "Chaugachha", "Jashore Sadar", "Jhikargachha",
    "Keshabpur", "Manirampur", "Sharsha",
  ],
  Jhenaidah: [
    "Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur",
    "Shailkupa",
  ],
  Khulna: [
    "Batiaghata", "Dacope", "Daulatpur", "Dighalia", "Dumuria", "Harintana",
    "Khalishpur", "Khan Jahan Ali", "Khulna Sadar", "Koyra", "Labanchara",
    "Paikgachha", "Phultala", "Rupsha", "Sonadanga", "Terokhada",
  ],
  Kushtia: [
    "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur",
  ],
  Magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  Meherpur: ["Gangni", "Meherpur Sadar", "Mujibnagar"],
  Narail: ["Kalia", "Lohagara", "Narail Sadar"],
  Satkhira: [
    "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar",
    "Shyamnagar", "Tala",
  ],

  // Barishal division
  Barguna: [
    "Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali",
  ],
  Barishal: [
    "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Barishal Sadar",
    "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur",
  ],
  Bhola: [
    "Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan",
    "Manpura", "Tazumuddin",
  ],
  Jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  Patuakhali: [
    "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj",
    "Patuakhali Sadar", "Rangabali",
  ],
  Pirojpur: [
    "Bhandaria", "Indurkani", "Kawkhali", "Mathbaria", "Nazirpur",
    "Nesarabad", "Pirojpur Sadar",
  ],

  // Sylhet division
  Habiganj: [
    "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Habiganj Sadar",
    "Lakhai", "Madhabpur", "Nabiganj", "Shayestaganj",
  ],
  Moulvibazar: [
    "Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar",
    "Rajnagar", "Sreemangal",
  ],
  Sunamganj: [
    "Bishwamvarpur", "Chhatak", "Derai", "Dharmapasha", "Dowarabazar",
    "Jagannathpur", "Jamalganj", "Madhyanagar", "Shantiganj", "Sullah",
    "Sunamganj Sadar", "Tahirpur",
  ],
  Sylhet: [
    "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma",
    "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat",
    "Osmani Nagar", "Sylhet Sadar", "Zakiganj",
  ],

  // Rangpur division
  Dinajpur: [
    "Biral", "Birampur", "Birganj", "Bochaganj", "Chirirbandar",
    "Dinajpur Sadar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole",
    "Khansama", "Nawabganj", "Parbatipur",
  ],
  Gaibandha: [
    "Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur",
    "Saghata", "Sundarganj",
  ],
  Kurigram: [
    "Bhurungamari", "Char Rajibpur", "Chilmari", "Kurigram Sadar",
    "Nageshwari", "Phulbari", "Rajarhat", "Raomari", "Ulipur",
  ],
  Lalmonirhat: [
    "Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram",
  ],
  Nilphamari: [
    "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur",
  ],
  Panchagarh: ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"],
  Rangpur: [
    "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj",
    "Rangpur Sadar", "Taraganj",
  ],
  Thakurgaon: [
    "Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar",
  ],

  // Mymensingh division
  Jamalpur: [
    "Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj",
    "Melandaha", "Sarishabari",
  ],
  Mymensingh: [
    "Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon", "Gauripur", "Haluaghat",
    "Ishwarganj", "Muktagachha", "Mymensingh Sadar", "Nandail", "Phulpur",
    "Tarakanda", "Trishal",
  ],
  Netrokona: [
    "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri",
    "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala",
  ],
  Sherpur: ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"],
};

export const DHAKA_DISTRICT = "Dhaka";

export const BD_DISTRICTS = Object.keys(THANAS_BY_DISTRICT).sort((a, b) =>
  a.localeCompare(b),
);

export const getThanas = (district) => THANAS_BY_DISTRICT[district] || [];
