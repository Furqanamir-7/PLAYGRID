import bcrypt from "bcryptjs";

export interface DBData {
  users: any[];
  cities: any[];
  sports: any[];
  venues: any[];
  tournaments: any[];
  tournamentVenues: any[];
  teams: any[];
  players: any[];
  teamPlayers: any[];
  registrations: any[];
  payments: any[];
  groups: any[];
  groupTeams: any[];
  stages: any[];
  matches: any[];
  referees: any[];
  matchOfficials: any[];
  matchResults: any[];
  matchEvents: any[];
  standings: any[];
  auditLogs: any[];
}

export function generateSeedData(): DBData {
  const passwordHash = bcrypt.hashSync("Admin@123", 10);
  const organizerHash = bcrypt.hashSync("Organizer@123", 10);
  const managerHash = bcrypt.hashSync("Manager@123", 10);

  // 1. Users
  const users = [
    {
      id: "usr_admin",
      name: "Taimur Malik",
      email: "admin@playgrid.pk",
      passwordHash,
      phone: "+92 300 1234567",
      role: "SUPER_ADMIN",
      isActive: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
    {
      id: "usr_org_khi",
      name: "Kamran Siddiqui",
      email: "organizer.khi@playgrid.pk",
      passwordHash: organizerHash,
      phone: "+92 321 9876543",
      role: "ORGANIZER",
      isActive: true,
      createdAt: new Date("2026-01-05"),
      updatedAt: new Date("2026-01-05"),
    },
    {
      id: "usr_org_lhr",
      name: "Bilal Cheema",
      email: "organizer.lhr@playgrid.pk",
      passwordHash: organizerHash,
      phone: "+92 333 4567890",
      role: "ORGANIZER",
      isActive: true,
      createdAt: new Date("2026-01-05"),
      updatedAt: new Date("2026-01-05"),
    },
    {
      id: "usr_org_isb",
      name: "Daniyal Abbasi",
      email: "organizer.isb@playgrid.pk",
      passwordHash: organizerHash,
      phone: "+92 345 5678901",
      role: "ORGANIZER",
      isActive: true,
      createdAt: new Date("2026-01-05"),
      updatedAt: new Date("2026-01-05"),
    },
  ];

  // 2. Cities
  const cities = [
    { id: "city_khi", name: "Karachi", province: "Sindh" },
    { id: "city_lhr", name: "Lahore", province: "Punjab" },
    { id: "city_isb", name: "Islamabad", province: "ICT" },
    { id: "city_rwp", name: "Rawalpindi", province: "Punjab" },
    { id: "city_fsd", name: "Faisalabad", province: "Punjab" },
    { id: "city_pew", name: "Peshawar", province: "KPK" },
    { id: "city_mux", name: "Multan", province: "Punjab" },
    { id: "city_qta", name: "Quetta", province: "Balochistan" },
  ];

  // 3. Sports
  const sports = [
    {
      id: "sport_futsal",
      name: "Futsal",
      playersOnField: 5,
      maxSquadSize: 12,
      matchDurationMinutes: 40,
      periods: 2,
    },
  ];

  // 4. Venues (10)
  const venues = [
    {
      id: "ven_khi_1",
      name: "Seaview Futsal Arena",
      address: "Beach Avenue, Clifton Block 2",
      cityId: "city_khi",
      surfaceType: "artificial_turf",
      capacity: 350,
      hasFloodlights: true,
      contactPhone: "+92 300 2345671",
    },
    {
      id: "ven_khi_2",
      name: "The Cage DHA Phase 6",
      address: "Khayaban-e-Ittehad, Phase 6 DHA",
      cityId: "city_khi",
      surfaceType: "artificial_turf",
      capacity: 400,
      hasFloodlights: true,
      contactPhone: "+92 300 2345672",
    },
    {
      id: "ven_khi_3",
      name: "Gulshan Sports Dome",
      address: "Block 13-D, Gulshan-e-Iqbal",
      cityId: "city_khi",
      surfaceType: "sports_court",
      capacity: 300,
      hasFloodlights: true,
      contactPhone: "+92 300 2345673",
    },
    {
      id: "ven_lhr_1",
      name: "Gulberg Kick Arena",
      address: "Main Boulevard, Gulberg III",
      cityId: "city_lhr",
      surfaceType: "artificial_turf",
      capacity: 500,
      hasFloodlights: true,
      contactPhone: "+92 300 4567891",
    },
    {
      id: "ven_lhr_2",
      name: "Johar Town Futsal Hub",
      address: "G-Block, Phase 1, Johar Town",
      cityId: "city_lhr",
      surfaceType: "sports_court",
      capacity: 250,
      hasFloodlights: true,
      contactPhone: "+92 300 4567892",
    },
    {
      id: "ven_lhr_3",
      name: "DHA Phase 5 Turf Club",
      address: "Sector J, DHA Phase 5",
      cityId: "city_lhr",
      surfaceType: "artificial_turf",
      capacity: 450,
      hasFloodlights: true,
      contactPhone: "+92 300 4567893",
    },
    {
      id: "ven_isb_1",
      name: "F-9 Park Futsal Courts",
      address: "Gate 2, Fatima Jinnah Park, Sector F-9",
      cityId: "city_isb",
      surfaceType: "artificial_turf",
      capacity: 600,
      hasFloodlights: true,
      contactPhone: "+92 300 5678901",
    },
    {
      id: "ven_isb_2",
      name: "Blue Area Indoor Arena",
      address: "Jinnah Avenue, Blue Area",
      cityId: "city_isb",
      surfaceType: "indoor_wooden",
      capacity: 500,
      hasFloodlights: true,
      contactPhone: "+92 300 5678902",
    },
    {
      id: "ven_rwp_1",
      name: "Bahria Town Sports Complex",
      address: "Phase 7, Bahria Town",
      cityId: "city_rwp",
      surfaceType: "artificial_turf",
      capacity: 400,
      hasFloodlights: true,
      contactPhone: "+92 300 6789012",
    },
    {
      id: "ven_pew_1",
      name: "Hayatabad Futsal Ground",
      address: "Phase 3 Sports Complex, Hayatabad",
      cityId: "city_pew",
      surfaceType: "artificial_turf",
      capacity: 350,
      hasFloodlights: true,
      contactPhone: "+92 300 7890123",
    },
  ];

  // 5. Referees (12)
  const referees = [
    { id: "ref_1", fullName: "Zahid Farooq", phone: "+92 312 1110001", cityId: "city_khi", certificationLevel: "NATIONAL", isActive: true },
    { id: "ref_2", fullName: "Shabbir Hussain", phone: "+92 312 1110002", cityId: "city_khi", certificationLevel: "REGIONAL", isActive: true },
    { id: "ref_3", fullName: "Shahid Rasheed", phone: "+92 312 1110003", cityId: "city_khi", certificationLevel: "LOCAL", isActive: true },
    { id: "ref_4", fullName: "Naveed Akram", phone: "+92 312 1110004", cityId: "city_lhr", certificationLevel: "NATIONAL", isActive: true },
    { id: "ref_5", fullName: "Mian Tariq", phone: "+92 312 1110005", cityId: "city_lhr", certificationLevel: "REGIONAL", isActive: true },
    { id: "ref_6", fullName: "Kashif Butt", phone: "+92 312 1110006", cityId: "city_lhr", certificationLevel: "LOCAL", isActive: true },
    { id: "ref_7", fullName: "Waqas Mirza", phone: "+92 312 1110007", cityId: "city_isb", certificationLevel: "NATIONAL", isActive: true },
    { id: "ref_8", fullName: "Imran Lodhi", phone: "+92 312 1110008", cityId: "city_isb", certificationLevel: "REGIONAL", isActive: true },
    { id: "ref_9", fullName: "Babar Kayani", phone: "+92 312 1110009", cityId: "city_rwp", certificationLevel: "REGIONAL", isActive: true },
    { id: "ref_10", fullName: "Fahad Afridi", phone: "+92 312 1110010", cityId: "city_pew", certificationLevel: "NATIONAL", isActive: true },
    { id: "ref_11", fullName: "Sohail Mengal", phone: "+92 312 1110011", cityId: "city_qta", certificationLevel: "LOCAL", isActive: true },
    { id: "ref_12", fullName: "Adnan Qureshi", phone: "+92 312 1110012", cityId: "city_fsd", certificationLevel: "REGIONAL", isActive: true },
  ];

  // 6. Teams (24)
  const teamDefs = [
    // Karachi (8)
    { id: "team_khi_1", name: "Clifton Strikers", shortName: "CLS", cityId: "city_khi", primaryColor: "#8E4585", foundedYear: 2021 },
    { id: "team_khi_2", name: "Lyari Lions", shortName: "LYL", cityId: "city_khi", primaryColor: "#E0A43B", foundedYear: 2019 },
    { id: "team_khi_3", name: "Saddar Stallions", shortName: "SDS", cityId: "city_khi", primaryColor: "#3FB27F", foundedYear: 2022 },
    { id: "team_khi_4", name: "Korangi Kings", shortName: "KGK", cityId: "city_khi", primaryColor: "#3B1838", foundedYear: 2020 },
    { id: "team_khi_5", name: "Gulshan Gladiators", shortName: "GLG", cityId: "city_khi", primaryColor: "#E25563", foundedYear: 2023 },
    { id: "team_khi_6", name: "Nazimabad Ninjas", shortName: "NZN", cityId: "city_khi", primaryColor: "#5E2A59", foundedYear: 2021 },
    { id: "team_khi_7", name: "DHA Dynamos", shortName: "DHD", cityId: "city_khi", primaryColor: "#C68BBF", foundedYear: 2020 },
    { id: "team_khi_8", name: "Malir Mavericks", shortName: "MLM", cityId: "city_khi", primaryColor: "#1E1922", foundedYear: 2024 },

    // Lahore (8)
    { id: "team_lhr_1", name: "Gulberg Giants", shortName: "GBG", cityId: "city_lhr", primaryColor: "#8E4585", foundedYear: 2020 },
    { id: "team_lhr_2", name: "Model Town Mavericks", shortName: "MTM", cityId: "city_lhr", primaryColor: "#3FB27F", foundedYear: 2021 },
    { id: "team_lhr_3", name: "Johar Town Jaguars", shortName: "JTJ", cityId: "city_lhr", primaryColor: "#E0A43B", foundedYear: 2019 },
    { id: "team_lhr_4", name: "Anarkali Arrows", shortName: "AKA", cityId: "city_lhr", primaryColor: "#E25563", foundedYear: 2023 },
    { id: "team_lhr_5", name: "Defence Dragons", shortName: "DFD", cityId: "city_lhr", primaryColor: "#5E2A59", foundedYear: 2018 },
    { id: "team_lhr_6", name: "Shalimar Sharks", shortName: "SMS", cityId: "city_lhr", primaryColor: "#3B1838", foundedYear: 2022 },
    { id: "team_lhr_7", name: "Iqbal Town Titans", shortName: "ITT", cityId: "city_lhr", primaryColor: "#C68BBF", foundedYear: 2021 },
    { id: "team_lhr_8", name: "Cantt Cobras", shortName: "CCB", cityId: "city_lhr", primaryColor: "#1E1922", foundedYear: 2024 },

    // Islamabad / Rawalpindi (8)
    { id: "team_isb_1", name: "Margalla Hawks", shortName: "MGH", cityId: "city_isb", primaryColor: "#8E4585", foundedYear: 2021 },
    { id: "team_isb_2", name: "F-7 Falcons", shortName: "F7F", cityId: "city_isb", primaryColor: "#3FB27F", foundedYear: 2020 },
    { id: "team_isb_3", name: "Blue Area Blazers", shortName: "BAB", cityId: "city_isb", primaryColor: "#E0A43B", foundedYear: 2022 },
    { id: "team_isb_4", name: "Bahria Bulls", shortName: "BHB", cityId: "city_rwp", primaryColor: "#E25563", foundedYear: 2021 },
    { id: "team_isb_5", name: "Saddar Rawalpindi Rangers", shortName: "SRR", cityId: "city_rwp", primaryColor: "#5E2A59", foundedYear: 2019 },
    { id: "team_isb_6", name: "G-11 Warriors", shortName: "G11", cityId: "city_isb", primaryColor: "#3B1838", foundedYear: 2023 },
    { id: "team_isb_7", name: "Pindi Panthers", shortName: "PDP", cityId: "city_rwp", primaryColor: "#C68BBF", foundedYear: 2020 },
    { id: "team_isb_8", name: "I-8 Invincibles", shortName: "I8I", cityId: "city_isb", primaryColor: "#1E1922", foundedYear: 2024 },
  ];

  const teams: any[] = [];
  const teamManagers: any[] = [];

  teamDefs.forEach((td) => {
    const managerId = `usr_mgr_${td.shortName.toLowerCase()}`;
    const managerEmail = `manager.${td.shortName.toLowerCase()}@playgrid.pk`;
    teamManagers.push({
      id: managerId,
      name: `${td.name} Manager`,
      email: managerEmail,
      passwordHash: managerHash,
      phone: `+92 300 ${Math.floor(1000000 + Math.random() * 9000000)}`,
      role: "TEAM_MANAGER",
      isActive: true,
      createdAt: new Date("2026-02-01"),
      updatedAt: new Date("2026-02-01"),
    });

    teams.push({
      id: td.id,
      name: td.name,
      shortName: td.shortName,
      cityId: td.cityId,
      managerId,
      logoUrl: null,
      primaryColor: td.primaryColor,
      foundedYear: td.foundedYear,
      createdAt: new Date("2026-02-01"),
    });
  });

  users.push(...teamManagers);

  // 7. Tournaments (3)
  const tournaments = [
    {
      id: "tourn_khi_2026",
      name: "PlayGrid Karachi Futsal League 2026",
      slug: "karachi-futsal-league-2026",
      sportId: "sport_futsal",
      cityId: "city_khi",
      organizerId: "usr_org_khi",
      format: "LEAGUE",
      status: "ONGOING",
      startDate: new Date("2026-10-25"),
      endDate: new Date("2026-12-13"),
      registrationDeadline: new Date("2026-10-15"),
      entryFeePkr: 25000,
      prizePoolPkr: 300000,
      maxTeams: 8,
      minSquadSize: 7,
      maxSquadSize: 12,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      description: "Karachi's flagship 8-team premier futsal championship. Fast-paced action under lights at Seaview Arena and The Cage.",
      bannerUrl: "/brand/og-image.jpg",
      createdAt: new Date("2026-09-01"),
      updatedAt: new Date("2026-10-25"),
    },
    {
      id: "tourn_lhr_2026",
      name: "Lahore Winter Futsal Cup 2026",
      slug: "lahore-winter-futsal-cup-2026",
      sportId: "sport_futsal",
      cityId: "city_lhr",
      organizerId: "usr_org_lhr",
      format: "GROUP_KNOCKOUT",
      status: "REGISTRATION_OPEN",
      startDate: new Date("2026-12-12"),
      endDate: new Date("2026-12-21"),
      registrationDeadline: new Date("2026-12-05"),
      entryFeePkr: 20000,
      prizePoolPkr: 200000,
      maxTeams: 8,
      minSquadSize: 7,
      maxSquadSize: 12,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      description: "Winter futsal showdown in Lahore featuring group stages followed by intense knockouts.",
      bannerUrl: "/brand/og-image.jpg",
      createdAt: new Date("2026-10-01"),
      updatedAt: new Date("2026-10-01"),
    },
    {
      id: "tourn_isb_2026",
      name: "Islamabad Corporate Futsal Championship 2026",
      slug: "islamabad-corporate-futsal-championship-2026",
      sportId: "sport_futsal",
      cityId: "city_isb",
      organizerId: "usr_org_isb",
      format: "KNOCKOUT",
      status: "COMPLETED",
      startDate: new Date("2026-09-06"),
      endDate: new Date("2026-09-14"),
      registrationDeadline: new Date("2026-08-25"),
      entryFeePkr: 30000,
      prizePoolPkr: 400000,
      maxTeams: 8,
      minSquadSize: 7,
      maxSquadSize: 12,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      description: "High-stakes corporate knockout tournament in the twin cities at F-9 Park and Blue Area Arena.",
      bannerUrl: "/brand/og-image.jpg",
      createdAt: new Date("2026-08-01"),
      updatedAt: new Date("2026-09-14"),
    },
  ];

  // Tournament Venues
  const tournamentVenues = [
    { tournamentId: "tourn_khi_2026", venueId: "ven_khi_1" },
    { tournamentId: "tourn_khi_2026", venueId: "ven_khi_2" },
    { tournamentId: "tourn_lhr_2026", venueId: "ven_lhr_1" },
    { tournamentId: "tourn_lhr_2026", venueId: "ven_lhr_2" },
    { tournamentId: "tourn_isb_2026", venueId: "ven_isb_1" },
    { tournamentId: "tourn_isb_2026", venueId: "ven_isb_2" },
  ];

  // 8. Players & Squad Generation (24 teams * 10 players = 240 players)
  const firstNames = [
    "Hamza", "Usman", "Bilal", "Saad", "Zain", "Faizan", "Ahmed", "Daniyal", "Hassan",
    "Shahzaib", "Arsalan", "Talha", "Umair", "Waleed", "Moiz", "Rehan", "Junaid",
    "Taimoor", "Ali", "Noman", "Farhan", "Haris", "Kamran", "Asad", "Khurram", "Shehroz"
  ];
  const lastNames = [
    "Ali", "Tariq", "Ahmed", "Qureshi", "Abbas", "Khan", "Raza", "Sheikh", "Iqbal",
    "Malik", "Butt", "Siddiqui", "Javed", "Akhtar", "Hussain", "Baig", "Afridi",
    "Khattak", "Hamza", "Yousaf", "Chaudhry", "Mirza", "Shah", "Ghafoor", "Abbasi"
  ];

  const positions = ["GOALKEEPER", "DEFENDER", "DEFENDER", "WINGER", "WINGER", "WINGER", "PIVOT", "PIVOT", "DEFENDER", "WINGER"];

  const players: any[] = [];
  const teamPlayers: any[] = [];
  let playerCounter = 1;

  // Track team players per tournament:
  // Karachi teams (1-8) -> tourn_khi_2026
  // Lahore teams (1-8) -> tourn_lhr_2026
  // Islamabad teams (1-8) -> tourn_isb_2026
  teamDefs.forEach((team, teamIdx) => {
    let tournId = "tourn_khi_2026";
    if (teamIdx >= 8 && teamIdx < 16) tournId = "tourn_lhr_2026";
    if (teamIdx >= 16) tournId = "tourn_isb_2026";

    for (let p = 0; p < 10; p++) {
      const pid = `ply_${playerCounter}`;
      const fn = firstNames[(teamIdx * 3 + p) % firstNames.length];
      const ln = lastNames[(teamIdx * 2 + p) % lastNames.length];
      const pos = positions[p];
      const jersey = p === 0 ? 1 : p === 6 ? 9 : p === 7 ? 10 : p + 2;

      const pObj = {
        id: pid,
        fullName: `${fn} ${ln}`,
        dateOfBirth: new Date(1996 + (p % 8), (p % 12), 10 + (p % 15)),
        cnic: `42${teamIdx.toString().padStart(2, "0")}1-${(1000000 + playerCounter).toString()}-${(p % 9) + 1}`,
        phone: `+92 3${(p % 4) + 1}${teamIdx % 10} ${(1000000 + playerCounter).toString().slice(0, 7)}`,
        preferredPosition: pos,
        photoUrl: null,
        createdAt: new Date("2026-03-01"),
      };

      players.push(pObj);

      teamPlayers.push({
        id: `tp_${playerCounter}`,
        teamId: team.id,
        playerId: pid,
        tournamentId: tournId,
        jerseyNumber: jersey,
        isCaptain: p === 1, // Second player is captain
        joinedAt: new Date("2026-09-01"),
      });

      playerCounter++;
    }
  });

  // 9. Registrations & Payments
  const registrations: any[] = [];
  const payments: any[] = [];

  // Karachi Tournament: All 8 teams approved, payments verified
  for (let i = 0; i < 8; i++) {
    const regId = `reg_khi_${i + 1}`;
    registrations.push({
      id: regId,
      tournamentId: "tourn_khi_2026",
      teamId: teamDefs[i].id,
      status: "APPROVED",
      submittedAt: new Date("2026-10-05"),
      reviewedById: "usr_org_khi",
      reviewedAt: new Date("2026-10-08"),
      rejectionReason: null,
    });

    payments.push({
      id: `pay_khi_${i + 1}`,
      registrationId: regId,
      amountPkr: 25000,
      method: i % 2 === 0 ? "JAZZCASH" : "EASYPAISA",
      transactionRef: `TID-KHI-2026-${10000 + i}`,
      status: "VERIFIED",
      paidAt: new Date("2026-10-06"),
      verifiedById: "usr_org_khi",
    });
  }

  // Lahore Tournament (Seed 6 registrations: 3 APPROVED, 2 PENDING, 1 REJECTED)
  for (let i = 8; i < 14; i++) {
    const regIdx = i - 7;
    const regId = `reg_lhr_${regIdx}`;
    let regStatus = "APPROVED";
    let payStatus = "VERIFIED";
    let rejReason: string | null = null;

    if (regIdx === 4) {
      regStatus = "PENDING";
      payStatus = "PENDING";
    } else if (regIdx === 5) {
      regStatus = "PENDING";
      payStatus = "PENDING";
    } else if (regIdx === 6) {
      regStatus = "REJECTED";
      payStatus = "FAILED";
      rejReason = "Squad below minimum size";
    }

    registrations.push({
      id: regId,
      tournamentId: "tourn_lhr_2026",
      teamId: teamDefs[i].id,
      status: regStatus,
      submittedAt: new Date("2026-11-01"),
      reviewedById: regStatus === "PENDING" ? null : "usr_org_lhr",
      reviewedAt: regStatus === "PENDING" ? null : new Date("2026-11-04"),
      rejectionReason: rejReason,
    });

    payments.push({
      id: `pay_lhr_${regIdx}`,
      registrationId: regId,
      amountPkr: 20000,
      method: regIdx % 2 === 0 ? "JAZZCASH" : "EASYPAISA",
      transactionRef: `TID-LHR-2026-${20000 + regIdx}`,
      status: payStatus,
      paidAt: new Date("2026-11-02"),
      verifiedById: payStatus === "VERIFIED" ? "usr_org_lhr" : null,
    });
  }

  // Islamabad Tournament: All 8 teams approved, payments verified
  for (let i = 16; i < 24; i++) {
    const regIdx = i - 15;
    const regId = `reg_isb_${regIdx}`;
    registrations.push({
      id: regId,
      tournamentId: "tourn_isb_2026",
      teamId: teamDefs[i].id,
      status: "APPROVED",
      submittedAt: new Date("2026-08-10"),
      reviewedById: "usr_org_isb",
      reviewedAt: new Date("2026-08-12"),
      rejectionReason: null,
    });

    payments.push({
      id: `pay_isb_${regIdx}`,
      registrationId: regId,
      amountPkr: 30000,
      method: "BANK_TRANSFER",
      transactionRef: `TID-ISB-2026-${30000 + regIdx}`,
      status: "VERIFIED",
      paidAt: new Date("2026-08-11"),
      verifiedById: "usr_org_isb",
    });
  }

  // 10. Stages & Groups
  const stages = [
    // Karachi League
    { id: "stg_khi_league", tournamentId: "tourn_khi_2026", name: "League", stageOrder: 1, isKnockout: false },

    // Lahore Cup
    { id: "stg_lhr_grp", tournamentId: "tourn_lhr_2026", name: "Group Stage", stageOrder: 1, isKnockout: false },
    { id: "stg_lhr_semi", tournamentId: "tourn_lhr_2026", name: "Semi-Final", stageOrder: 2, isKnockout: true },
    { id: "stg_lhr_final", tournamentId: "tourn_lhr_2026", name: "Final", stageOrder: 3, isKnockout: true },

    // Islamabad Championship (Knockout)
    { id: "stg_isb_qf", tournamentId: "tourn_isb_2026", name: "Quarter-Finals", stageOrder: 1, isKnockout: true },
    { id: "stg_isb_sf", tournamentId: "tourn_isb_2026", name: "Semi-Finals", stageOrder: 2, isKnockout: true },
    { id: "stg_isb_3rd", tournamentId: "tourn_isb_2026", name: "3rd Place Match", stageOrder: 3, isKnockout: true },
    { id: "stg_isb_final", tournamentId: "tourn_isb_2026", name: "Grand Final", stageOrder: 4, isKnockout: true },
  ];

  // Groups for Lahore
  const groups = [
    { id: "grp_lhr_a", tournamentId: "tourn_lhr_2026", name: "Group A" },
    { id: "grp_lhr_b", tournamentId: "tourn_lhr_2026", name: "Group B" },
  ];

  const groupTeams = [
    { groupId: "grp_lhr_a", teamId: teamDefs[8].id },
    { groupId: "grp_lhr_a", teamId: teamDefs[9].id },
    { groupId: "grp_lhr_a", teamId: teamDefs[10].id },
    { groupId: "grp_lhr_b", teamId: teamDefs[11].id },
    { groupId: "grp_lhr_b", teamId: teamDefs[12].id },
    { groupId: "grp_lhr_b", teamId: teamDefs[13].id },
  ];

  // 11. Matches, Results, Officials & Events
  const matches: any[] = [];
  const matchOfficials: any[] = [];
  const matchResults: any[] = [];
  const matchEvents: any[] = [];

  // ==========================================
  // Karachi League: 8 teams, 7 rounds = 28 matches
  // Rounds 1 to 5 COMPLETED (20 matches)
  // Rounds 6 to 7 SCHEDULED (8 matches)
  // ==========================================
  const khiTeams = teamDefs.slice(0, 8);
  // Predefined round robin pairings for 8 teams (Rounds 1-7)
  const roundPairings = [
    // Round 1
    [[0, 7], [1, 6], [2, 5], [3, 4]],
    // Round 2
    [[7, 4], [5, 3], [6, 2], [0, 1]],
    // Round 3
    [[1, 7], [2, 0], [3, 6], [4, 5]],
    // Round 4
    [[7, 5], [6, 4], [0, 3], [1, 2]],
    // Round 5
    [[2, 7], [3, 1], [4, 0], [5, 6]],
    // Round 6 (Scheduled)
    [[7, 6], [0, 5], [1, 4], [2, 3]],
    // Round 7 (Scheduled)
    [[3, 7], [4, 2], [5, 1], [6, 0]],
  ];

  const completedScores = [
    // R1: 4 matches
    [5, 3], [4, 4], [7, 2], [3, 1],
    // R2: 4 matches
    [2, 6], [4, 2], [1, 5], [3, 3],
    // R3: 4 matches
    [6, 4], [2, 3], [5, 2], [1, 4],
    // R4: 4 matches
    [3, 5], [4, 1], [6, 2], [2, 2],
    // R5: 4 matches
    [3, 4], [5, 1], [2, 5], [4, 3],
  ];

  let mCount = 1;
  let scoreIdx = 0;

  for (let r = 0; r < 7; r++) {
    const pairings = roundPairings[r];
    const isCompleted = r < 5;
    const roundDate = new Date(2026, 9, 25 + r * 7); // Sundays starting Oct 25

    pairings.forEach((pair, pIdx) => {
      const homeTeam = khiTeams[pair[0]];
      const awayTeam = khiTeams[pair[1]];
      const matchId = `mat_khi_${mCount}`;
      const venId = pIdx % 2 === 0 ? "ven_khi_1" : "ven_khi_2";

      // Scheduled hours: 7:00 PM, 8:00 PM, 9:00 PM, 10:00 PM
      const matchTime = new Date(roundDate);
      matchTime.setHours(19 + pIdx, 0, 0, 0);

      const matchObj = {
        id: matchId,
        tournamentId: "tourn_khi_2026",
        stageId: "stg_khi_league",
        groupId: null,
        roundNumber: r + 1,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        venueId: venId,
        scheduledAt: matchTime,
        status: isCompleted ? "COMPLETED" : "SCHEDULED",
        nextMatchId: null,
        nextMatchSlot: null,
      };

      matches.push(matchObj);

      // Assign officials
      matchOfficials.push(
        { matchId, refereeId: referees[pIdx % 3].id, role: "FIRST_REFEREE" },
        { matchId, refereeId: referees[(pIdx + 1) % 3].id, role: "SECOND_REFEREE" },
        { matchId, refereeId: referees[(pIdx + 2) % 3].id, role: "TIMEKEEPER" }
      );

      if (isCompleted) {
        const [hs, as] = completedScores[scoreIdx];
        scoreIdx++;

        // Find home & away team players
        const hPlayers = teamPlayers.filter((tp) => tp.teamId === homeTeam.id);
        const aPlayers = teamPlayers.filter((tp) => tp.teamId === awayTeam.id);

        const winnerTeamId = hs > as ? homeTeam.id : as > hs ? awayTeam.id : null;
        const motmPlayer = hs >= as ? hPlayers[1].playerId : aPlayers[1].playerId;

        matchResults.push({
          matchId,
          homeScore: hs,
          awayScore: as,
          homePenalties: null,
          awayPenalties: null,
          winnerTeamId,
          homeFouls: 2 + (mCount % 4),
          awayFouls: 3 + ((mCount + 1) % 3),
          manOfTheMatchPlayerId: motmPlayer,
          recordedById: "usr_org_khi",
          recordedAt: new Date(matchTime.getTime() + 50 * 60000),
        });

        // Add Goal Events
        let min = 4;
        for (let g = 0; g < hs; g++) {
          const scoringPlayer = hPlayers[g % hPlayers.length];
          matchEvents.push({
            id: `evt_khi_${matchId}_g_h_${g}`,
            matchId,
            teamId: homeTeam.id,
            playerId: scoringPlayer.playerId,
            eventType: "GOAL",
            minute: min,
            notes: null,
          });
          min += 6;
        }

        min = 8;
        for (let g = 0; g < as; g++) {
          const scoringPlayer = aPlayers[g % aPlayers.length];
          matchEvents.push({
            id: `evt_khi_${matchId}_g_a_${g}`,
            matchId,
            teamId: awayTeam.id,
            playerId: scoringPlayer.playerId,
            eventType: "GOAL",
            minute: min,
            notes: null,
          });
          min += 7;
        }

        // Add 1 yellow card
        matchEvents.push({
          id: `evt_khi_${matchId}_yc`,
          matchId,
          teamId: homeTeam.id,
          playerId: hPlayers[2].playerId,
          eventType: "YELLOW_CARD",
          minute: 28,
          notes: "Late sliding challenge",
        });

        // Occasional red card
        if (mCount === 3 || mCount === 12) {
          matchEvents.push({
            id: `evt_khi_${matchId}_rc`,
            matchId,
            teamId: awayTeam.id,
            playerId: aPlayers[3].playerId,
            eventType: "RED_CARD",
            minute: 34,
            notes: "Denial of obvious goal scoring opportunity",
          });
        }
      }

      mCount++;
    });
  }

  // ==========================================
  // Islamabad Tournament: Full 8-team Knockout Bracket
  // QF (4 matches) -> SF (2 matches) -> 3rd Place (1) -> Final (1)
  // Total 8 matches, all COMPLETED
  // ==========================================
  const isbTeams = teamDefs.slice(16, 24);

  // Grand Final
  const matFinal = {
    id: "mat_isb_final",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_final",
    groupId: null,
    roundNumber: 4,
    homeTeamId: isbTeams[0].id, // Margalla Hawks
    awayTeamId: isbTeams[1].id, // F-7 Falcons
    venueId: "ven_isb_1",
    scheduledAt: new Date("2026-09-14T20:00:00Z"),
    status: "COMPLETED",
    nextMatchId: null,
    nextMatchSlot: null,
  };

  // 3rd Place Match
  const mat3rd = {
    id: "mat_isb_3rd",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_3rd",
    groupId: null,
    roundNumber: 3,
    homeTeamId: isbTeams[2].id, // Blue Area Blazers
    awayTeamId: isbTeams[3].id, // Bahria Bulls
    venueId: "ven_isb_2",
    scheduledAt: new Date("2026-09-13T18:00:00Z"),
    status: "COMPLETED",
    nextMatchId: null,
    nextMatchSlot: null,
  };

  // Semi-Final 1
  const matSf1 = {
    id: "mat_isb_sf1",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_sf",
    groupId: null,
    roundNumber: 2,
    homeTeamId: isbTeams[0].id,
    awayTeamId: isbTeams[2].id,
    venueId: "ven_isb_1",
    scheduledAt: new Date("2026-09-11T19:00:00Z"),
    status: "COMPLETED",
    nextMatchId: "mat_isb_final",
    nextMatchSlot: "HOME",
  };

  // Semi-Final 2 (Decided on penalties: 4-4 FT, 5-4 Pens)
  const matSf2 = {
    id: "mat_isb_sf2",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_sf",
    groupId: null,
    roundNumber: 2,
    homeTeamId: isbTeams[1].id,
    awayTeamId: isbTeams[3].id,
    venueId: "ven_isb_2",
    scheduledAt: new Date("2026-09-11T20:30:00Z"),
    status: "COMPLETED",
    nextMatchId: "mat_isb_final",
    nextMatchSlot: "AWAY",
  };

  // Quarter-Finals 1 to 4
  const matQf1 = {
    id: "mat_isb_qf1",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_qf",
    groupId: null,
    roundNumber: 1,
    homeTeamId: isbTeams[0].id,
    awayTeamId: isbTeams[4].id,
    venueId: "ven_isb_1",
    scheduledAt: new Date("2026-09-07T18:00:00Z"),
    status: "COMPLETED",
    nextMatchId: "mat_isb_sf1",
    nextMatchSlot: "HOME",
  };
  const matQf2 = {
    id: "mat_isb_qf2",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_qf",
    groupId: null,
    roundNumber: 1,
    homeTeamId: isbTeams[2].id,
    awayTeamId: isbTeams[5].id,
    venueId: "ven_isb_1",
    scheduledAt: new Date("2026-09-07T19:30:00Z"),
    status: "COMPLETED",
    nextMatchId: "mat_isb_sf1",
    nextMatchSlot: "AWAY",
  };
  const matQf3 = {
    id: "mat_isb_qf3",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_qf",
    groupId: null,
    roundNumber: 1,
    homeTeamId: isbTeams[1].id,
    awayTeamId: isbTeams[6].id,
    venueId: "ven_isb_2",
    scheduledAt: new Date("2026-09-08T18:00:00Z"),
    status: "COMPLETED",
    nextMatchId: "mat_isb_sf2",
    nextMatchSlot: "HOME",
  };
  const matQf4 = {
    id: "mat_isb_qf4",
    tournamentId: "tourn_isb_2026",
    stageId: "stg_isb_qf",
    groupId: null,
    roundNumber: 1,
    homeTeamId: isbTeams[3].id,
    awayTeamId: isbTeams[7].id,
    venueId: "ven_isb_2",
    scheduledAt: new Date("2026-09-08T19:30:00Z"),
    status: "COMPLETED",
    nextMatchId: "mat_isb_sf2",
    nextMatchSlot: "AWAY",
  };

  const isbMatchesList = [matQf1, matQf2, matQf3, matQf4, matSf1, matSf2, mat3rd, matFinal];
  matches.push(...isbMatchesList);

  isbMatchesList.forEach((m) => {
    matchOfficials.push(
      { matchId: m.id, refereeId: referees[6].id, role: "FIRST_REFEREE" },
      { matchId: m.id, refereeId: referees[7].id, role: "SECOND_REFEREE" }
    );
  });

  // Results for Islamabad Knockout
  matchResults.push(
    {
      matchId: "mat_isb_qf1",
      homeScore: 6,
      awayScore: 2,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[0].id,
      homeFouls: 2,
      awayFouls: 4,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Hamza"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-07T19:00:00Z"),
    },
    {
      matchId: "mat_isb_qf2",
      homeScore: 4,
      awayScore: 3,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[2].id,
      homeFouls: 3,
      awayFouls: 3,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Bilal"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-07T20:30:00Z"),
    },
    {
      matchId: "mat_isb_qf3",
      homeScore: 5,
      awayScore: 1,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[1].id,
      homeFouls: 1,
      awayFouls: 2,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Usman"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-08T19:00:00Z"),
    },
    {
      matchId: "mat_isb_qf4",
      homeScore: 3,
      awayScore: 2,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[3].id,
      homeFouls: 4,
      awayFouls: 5,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Faizan"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-08T20:30:00Z"),
    },
    // Semi Final 1
    {
      matchId: "mat_isb_sf1",
      homeScore: 5,
      awayScore: 3,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[0].id,
      homeFouls: 3,
      awayFouls: 4,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Hamza"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-11T20:00:00Z"),
    },
    // Semi Final 2: Level 4-4, Penalties 5-4!
    {
      matchId: "mat_isb_sf2",
      homeScore: 4,
      awayScore: 4,
      homePenalties: 5,
      awayPenalties: 4,
      winnerTeamId: isbTeams[1].id,
      homeFouls: 5,
      awayFouls: 5,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Usman"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-11T21:40:00Z"),
    },
    // 3rd Place Match
    {
      matchId: "mat_isb_3rd",
      homeScore: 6,
      awayScore: 4,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[2].id,
      homeFouls: 2,
      awayFouls: 3,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Bilal"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-13T19:00:00Z"),
    },
    // Grand Final: Margalla Hawks 4 - 2 F-7 Falcons (Champion: Margalla Hawks!)
    {
      matchId: "mat_isb_final",
      homeScore: 4,
      awayScore: 2,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: isbTeams[0].id,
      homeFouls: 3,
      awayFouls: 4,
      manOfTheMatchPlayerId: players.find((p) => p.fullName.includes("Hamza"))?.id,
      recordedById: "usr_org_isb",
      recordedAt: new Date("2026-09-14T21:00:00Z"),
    }
  );

  // 12. Compute Standings for Karachi League
  const standingsMap: Record<string, {
    tournamentId: string;
    teamId: string;
    groupId: string | null;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }> = {};

  khiTeams.forEach((t) => {
    standingsMap[t.id] = {
      tournamentId: "tourn_khi_2026",
      teamId: t.id,
      groupId: null,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  matchResults.forEach((res) => {
    const m = matches.find((x) => x.id === res.matchId && x.tournamentId === "tourn_khi_2026");
    if (!m) return;
    const h = standingsMap[m.homeTeamId];
    const a = standingsMap[m.awayTeamId];
    if (h && a) {
      h.played++;
      a.played++;
      h.goalsFor += res.homeScore;
      h.goalsAgainst += res.awayScore;
      a.goalsFor += res.awayScore;
      a.goalsAgainst += res.homeScore;

      if (res.homeScore > res.awayScore) {
        h.won++;
        h.points += 3;
        a.lost++;
      } else if (res.homeScore === res.awayScore) {
        h.drawn++;
        h.points += 1;
        a.drawn++;
        a.points += 1;
      } else {
        a.won++;
        a.points += 3;
        h.lost++;
      }
      h.goalDifference = h.goalsFor - h.goalsAgainst;
      a.goalDifference = a.goalsFor - a.goalsAgainst;
    }
  });

  const standings = Object.values(standingsMap);

  // 13. Audit Logs
  const auditLogs = [
    {
      id: "aud_1",
      userId: "usr_admin",
      action: "INITIALIZE_SYSTEM",
      entity: "system",
      entityId: "playgrid",
      details: { version: "1.0.0", seededTournaments: 3 },
      createdAt: new Date("2026-09-01T00:00:00Z"),
    },
    {
      id: "aud_2",
      userId: "usr_org_khi",
      action: "GENERATE_FIXTURES",
      entity: "tournaments",
      entityId: "tourn_khi_2026",
      details: { rounds: 7, matches: 28 },
      createdAt: new Date("2026-10-18T10:00:00Z"),
    },
    {
      id: "aud_3",
      userId: "usr_org_isb",
      action: "COMPLETE_TOURNAMENT",
      entity: "tournaments",
      entityId: "tourn_isb_2026",
      details: { champion: "Margalla Hawks", runnerUp: "F-7 Falcons" },
      createdAt: new Date("2026-09-14T22:00:00Z"),
    },
  ];

  return {
    users,
    cities,
    sports,
    venues,
    tournaments,
    tournamentVenues,
    teams,
    players,
    teamPlayers,
    registrations,
    payments,
    groups,
    groupTeams,
    stages,
    matches,
    referees,
    matchOfficials,
    matchResults,
    matchEvents,
    standings,
    auditLogs,
  };
}

