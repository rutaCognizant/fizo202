interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
}

interface Activity {
  id: string;
  name: string;
  age: number;
  pushups: number;
  running: number;
  userId: string;
  createdAt: Date;
}

export { User, Activity };
