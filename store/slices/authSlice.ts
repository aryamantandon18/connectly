import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user:{
        id: string;
        email:string;
        profile:{
            name?:string;
            image?:string;
        }
    } | null
    loading: boolean;
}

const initialState: AuthState = {
    user: null, 
    loading: true, // Indicates the initial loading state
  };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        setUser(state, action:PayloadAction<AuthState['user']>){
            state.user = action.payload;
            state.loading = false;
        },
        clearUser(state){
            state.user = null;
            state.loading = false;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
          },
    },
});

export const {setUser,clearUser,setLoading} = authSlice.actions;
export default authSlice.reducer;

