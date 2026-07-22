src/components/Layout.tsx(8,17): error TS6133: 'LogOut' is declared but its value is never read.
src/components/Layout.tsx(9,35): error TS6133: 'HelpCircle' is declared but its value is never read.
src/components/Layout.tsx(9,64): error TS6133: 'User' is declared but its value is never read.
src/components/Layout.tsx(38,9): error TS6133: 'primaryLiveSeconds' is declared but its value is never read.
src/context/TimerContext.tsx(83,15): error TS2345: Argument of type '(prev: Record<string, TaskTimer>) => { [x: string]: TaskTimer | { startTime: null; elapsedSeconds: number; }; }' is not assignable to parameter of type 'SetStateAction<Record<string, TaskTimer>>'.
  Type '(prev: Record<string, TaskTimer>) => { [x: string]: TaskTimer | { startTime: null; elapsedSeconds: number; }; }' is not assignable to type '(prevState: Record<string, TaskTimer>) => Record<string, TaskTimer>'.
    Type '{ [x: string]: TaskTimer | { startTime: null; elapsedSeconds: number; }; }' is not assignable to type 'Record<string, TaskTimer>'.
      'string' index signatures are incompatible.
        Type 'TaskTimer | { startTime: null; elapsedSeconds: number; }' is not assignable to type 'TaskTimer'.
          Property 'taskTitle' is missing in type '{ startTime: null; elapsedSeconds: number; }' but required in type 'TaskTimer'.
src/pages/Dashboard.tsx(95,88): error TS2532: Object is possibly 'undefined'.
src/pages/Reports.tsx(3,1): error TS6192: All imports in import declaration are unused.
src/pages/Tasks.tsx(29,152): error TS6133: 'showToast' is declared but its value is never read.
Error: Command "npm run build" exited with 2
Deployment Summary