export const mockSummary = {
  totalBags: 24850,
  rate: 1245,
  perMinute: 20.8,
  target: 30000,
  achievement: 82.8
};

export const hourlyProduction = [
  {hour:"06:00", bags:820}, {hour:"07:00", bags:940}, {hour:"08:00", bags:1020},
  {hour:"09:00", bags:1180}, {hour:"10:00", bags:1250}, {hour:"11:00", bags:1210},
  {hour:"12:00", bags:1340}, {hour:"13:00", bags:1280}, {hour:"14:00", bags:1190},
  {hour:"15:00", bags:1320}, {hour:"16:00", bags:1410}
];

export const godowns = [
  {id:"G1", name:"Godown 1", bags:8420, belts:2, rate:1180, target:10000, percent:34},
  {id:"G2", name:"Godown 2", bags:7950, belts:3, rate:1090, target:9500, percent:32},
  {id:"G3", name:"Godown 3", bags:8480, belts:2, rate:1260, target:10500, percent:34}
];

export const belts = [
  {id:"G1-B1", name:"Godown 1 • Belt 1", status:"Running", bags:4250, rate:610, camera:"CAM-G1-01", lastEvent:"10:31:42"},
  {id:"G1-B2", name:"Godown 1 • Belt 2", status:"Running", bags:4170, rate:570, camera:"CAM-G1-02", lastEvent:"10:31:38"},
  {id:"G2-B1", name:"Godown 2 • Belt 1", status:"Running", bags:2850, rate:520, camera:"CAM-G2-01", lastEvent:"10:31:35"},
  {id:"G2-B2", name:"Godown 2 • Belt 2", status:"Stopped", bags:2540, rate:0, camera:"CAM-G2-02", lastEvent:"10:18:09"},
  {id:"G2-B3", name:"Godown 2 • Belt 3", status:"Running", bags:2560, rate:570, camera:"CAM-G2-03", lastEvent:"10:31:31"},
  {id:"G3-B1", name:"Godown 3 • Belt 1", status:"Running", bags:4280, rate:640, camera:"CAM-G3-01", lastEvent:"10:31:28"},
  {id:"G3-B2", name:"Godown 3 • Belt 2", status:"Running", bags:4200, rate:620, camera:"CAM-G3-02", lastEvent:"10:31:25"}
];

export const recentEvents = [
  {id:1, bag:"Bag #24,850", location:"Godown 3 • Belt 2", time:"10:31:25"},
  {id:2, bag:"Bag #24,849", location:"Godown 3 • Belt 1", time:"10:31:28"},
  {id:3, bag:"Bag #24,848", location:"Godown 2 • Belt 3", time:"10:31:31"},
  {id:4, bag:"Bag #24,847", location:"Godown 2 • Belt 1", time:"10:31:35"},
  {id:5, bag:"Bag #24,846", location:"Godown 1 • Belt 2", time:"10:31:38"}
];

export const alerts = [
  {id:1, level:"warning", title:"Production rate below target", description:"Godown 2 is operating 12% below its expected rate.", location:"Godown 2", time:"10:22 AM"},
  {id:2, level:"critical", title:"Conveyor belt stopped", description:"No bags detected on G2-B2 for more than 10 minutes.", location:"G2-B2", time:"10:18 AM"},
  {id:3, level:"resolved", title:"Camera connection restored", description:"Camera CAM-G1-02 is online and sending frames.", location:"G1-B2", time:"09:54 AM"},
  {id:4, level:"resolved", title:"Production rate recovered", description:"Godown 3 returned to its expected production range.", location:"Godown 3", time:"09:42 AM"}
];
