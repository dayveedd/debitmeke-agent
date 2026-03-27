import { useAuth0 } from "@auth0/auth0-react";
import { Loader2, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { Chat } from './components/Chat';
import { Vault } from './components/Vault';
import { AdminSimulator } from './components/AdminSimulator';

function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-orange animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center text-off-white">
        <p className="text-red-500 mb-4 font-bold">Error: {error.message}</p>
        <button 
          onClick={() => loginWithRedirect()} 
          className="px-6 py-3 bg-primary-orange text-charcoal font-black rounded-xl uppercase tracking-wider hover:bg-orange-600 transition-all shadow-[0_4px_15px_rgba(255,107,0,0.3)]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-4">
        <div className="bg-charcoal-light p-10 rounded-3xl border border-gray-800 shadow-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-primary-orange/10 rounded-full blur-3xl pointer-events-none"></div>

          <ShieldCheck className="w-20 h-20 text-primary-orange mb-6 z-10" />
          <h1 className="text-4xl font-black mb-3 tracking-wide text-off-white z-10">DebitMeKe</h1>
          <p className="text-gray-400 mb-10 text-lg z-10">Sign in to access your secure virtual card vault and AI agent.</p>
          
          <div className="w-full space-y-4 z-10">
            <button 
              onClick={() => loginWithRedirect()} 
              className="w-full bg-primary-orange text-charcoal font-black rounded-xl py-4 uppercase tracking-wider hover:bg-primary-orange/90 transition-all shadow-[0_4px_15px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 flex items-center justify-center"
            >
              <LogIn className="w-5 h-5 mr-3" />
              Log In
            </button>
            
            <button 
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })} 
              className="w-full bg-transparent border-2 border-gray-700 text-gray-300 font-bold rounded-xl py-4 uppercase tracking-wider hover:bg-gray-800 transition-all flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5 mr-3" />
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-charcoal text-off-white flex overflow-hidden font-sans">
      
      {/* Absolute Header with Auth Widget */}
      <div className="absolute top-6 right-8 z-50 flex items-center bg-charcoal/80 backdrop-blur-md py-2 px-4 rounded-full border border-gray-700 shadow-xl">
        {user?.picture ? (
          <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-primary-orange mr-3" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-primary-orange mr-3 flex items-center justify-center">
            <span className="text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <span className="text-sm font-bold mr-6 text-gray-200 hidden sm:block max-w-[150px] truncate">{user?.email}</span>
        <button 
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="text-xs uppercase tracking-widest font-black text-gray-400 hover:text-primary-orange transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="w-full md:w-[35%] lg:w-[30%] h-screen shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20 transition-all rounded-r-3xl overflow-hidden relative">
        <Chat />
      </div>
      <div className="hidden md:flex flex-col w-full md:w-[65%] lg:w-[70%] h-screen z-10 transition-all">
        <Vault />
      </div>

      {isAuthenticated && (
          <AdminSimulator ngrokUrl="https://debitmeke-backend.onrender.com" />
      )}
    </div>
  );
}

export default App;
