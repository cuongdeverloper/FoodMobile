// api/user.api.ts
import axios from "@/utils/axios.customize";
import AsyncStorage from "@react-native-async-storage/async-storage"
export const registerApi = (username: string, userLogin: string, password: string) => {
  return axios.post("/api/users/register", { username, userLogin, password });
};

export const loginApi = (userLogin: string, password: string) => {
  return axios.post<IBackendRes<IUserLogin>>("/api/auths/login", { userLogin, password });
};
export const getTopRestaurant = (ref:string) => {
  return axios.get<IBackendRes<ITopRestaurant[]>>(`/api/restaurant/${ref}`);
};
export const userInforApi = () => {
  return axios.get("/api/auths/userInformation");
};

export const printAsyncStorage = () => {
  AsyncStorage.getAllKeys((err, keys) => {
    AsyncStorage.multiGet(keys!, (error, stores) => {
      let asyncStorage: any = {}
        stores?.map((result, i, store) => {
          asyncStorage[store[i][0]] = store[i][1]
        });
        console.log(JSON.stringify(asyncStorage, null, 2));

    });
  });
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchMenuItemDetail = async (id: string) => {
  return await axios.get(`/api/restaurant/menu-items/${id}`);
};

export const getRestaurantById = (id: string) => {
  return axios.get(`/api/restaurant/${id}`, {
    headers: { delay: 1000 }
  });
};

