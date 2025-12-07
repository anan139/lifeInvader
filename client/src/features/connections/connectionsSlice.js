import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
}

export const fetchConnections = createAsyncThunk('connections/fetchConnections', async(token) => {
  const { data } = await api.get('/api/user/connections', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data.success ? data : null
})

const uniqueById = (list = []) => {
  const map = new Map()
  list.forEach((item) => {
    const id = item?._id || item
    if (id) {
      map.set(id, item)
    }
  })
  return Array.from(map.values())
}

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      if (action.payload) {
        state.connections = uniqueById(action.payload.connections)
        state.pendingConnections = uniqueById(action.payload.pendingConnections)
        state.followers = uniqueById(action.payload.followers)
        state.following = uniqueById(action.payload.following)
      }
    })
  }
})

export default connectionsSlice.reducer
