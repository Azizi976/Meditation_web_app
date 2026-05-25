import { createContext, useContext, useReducer, useCallback } from 'react';

const PlayerContext = createContext(null);

const initialState = {
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  voiceVolume: 1.0,
  ambientVolume: 0.4,
  selectedAmbient: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':        return { ...state, track: action.track, isPlaying: true, currentTime: 0 };
    case 'TOGGLE':      return { ...state, isPlaying: !state.isPlaying };
    case 'PLAY':        return { ...state, isPlaying: true };
    case 'PAUSE':       return { ...state, isPlaying: false };
    case 'SEEK':        return { ...state, currentTime: action.time };
    case 'TIME_UPDATE': return { ...state, currentTime: action.time };
    case 'DURATION':    return { ...state, duration: action.duration };
    case 'VOICE_VOL':   return { ...state, voiceVolume: action.value };
    case 'AMBIENT_VOL': return { ...state, ambientVolume: action.value };
    case 'SET_AMBIENT': return { ...state, selectedAmbient: action.sound };
    default:            return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadTrack     = useCallback(track  => dispatch({ type: 'LOAD',   track }),          []);
  const togglePlay    = useCallback(()     => dispatch({ type: 'TOGGLE' }),                 []);
  const play          = useCallback(()     => dispatch({ type: 'PLAY' }),                   []);
  const pause         = useCallback(()     => dispatch({ type: 'PAUSE' }),                  []);
  const seek          = useCallback(time   => dispatch({ type: 'SEEK',   time }),            []);
  const setVoiceVol   = useCallback(value  => dispatch({ type: 'VOICE_VOL',   value }),      []);
  const setAmbientVol = useCallback(value  => dispatch({ type: 'AMBIENT_VOL', value }),      []);
  const setAmbient    = useCallback(sound  => dispatch({ type: 'SET_AMBIENT', sound }),      []);
  const updateTime    = useCallback(time   => dispatch({ type: 'TIME_UPDATE', time }),       []);
  const setDuration   = useCallback(duration => dispatch({ type: 'DURATION', duration }),    []);

  return (
    <PlayerContext.Provider value={{
      ...state,
      loadTrack, togglePlay, play, pause, seek,
      setVoiceVol, setAmbientVol, setAmbient,
      updateTime, setDuration,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
