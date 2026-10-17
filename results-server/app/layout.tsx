import type {Metadata} from 'next';
export const metadata:Metadata={title:'Resolute Sixes Showdown',description:'Sideline clocks, game results and division standings.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
