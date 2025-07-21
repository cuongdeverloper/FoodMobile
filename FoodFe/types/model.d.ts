export { };
declare global {
    interface IBackendRes<T> {
        errorCode: string | string[] | number;
        message: string;
        statusCode: number | string;
        data?: T;
    }
    interface IRegister {
        _id: string;
    }
    interface IUserLogin {
        userLogin: string;
        _id: string;
        username: string;
        role: string;
        address: any;
        avatar: string;
        access_token: string;
        errorCode?: number | string;
        message?: string;
    }
    interface ITopRestaurant {
        _id: string
        name: string,
        phone: string,
        address: string,
        email: string,
        rating: number,
        image: string,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date,
        menu: IMenu[]
    }
    interface IMenu {
        _id: string;
        restaurant: string;
        title: string;
        createAt: Date;
        updateAt: Date;
        menuItem: IMenuItem[]
    }
    interface IMenuItem {
        _id: string;
        menu: string;
        title: string;
        basePrice: number;
        image: string;
        options: {
            title: string;
            description: string;
            additionalPrice: number
        }[],
        createdAt: Date;
        updateAt: Date;
    }
    export interface IMenuItemOption {
  title: string;
  description: string;
  additionalPrice: number;
}

export interface IMenuItemDetail {
  _id: string;
  title: string;
  basePrice: number;
  image: string;
  menu: string;
  options: IMenuItemOption[];
}

}