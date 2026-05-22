import Sidebar from './Sidebar';
import Head from 'next/head';

export default function Layout({ children, title = 'CalClone' }) {
  return (
    <>
      <Head><title>{title} | CalClone</title></Head>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
}