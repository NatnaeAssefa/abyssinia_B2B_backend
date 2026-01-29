import { Pool } from "generic-pool";
import { Redis } from "ioredis";
import RedisPool from "../../utilities/redis/Redis";
import { Socket } from "socket.io";

export class CacheService {
  private static instance: CacheService;
  private readonly redisPool: Pool<Redis>;

  private constructor() {
    this.redisPool = RedisPool;
  }

  private initialize = () => {
    // TODO check redis for any data and populate if empty
  };

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
      CacheService.instance.initialize();
    }
    return CacheService.instance;
  }

  // static handle(data: SocketRequestType): Promise<any> {
  //   let instance = CacheService.getInstance();
  //   switch (data.type) {
  //     case SocketActions.FETCH_TRIP_DATA:
  //       return instance.fetchTripData(data.data, data.socket);
  //     case SocketActions.ADD_TRIP:
  //       return instance.addNewTrip(data.data, data.socket);
  //     case SocketActions.VOID_TRIP:
  //     case SocketActions.CHECKOUT_TRIP:
  //     case SocketActions.RESERVE_SEAT_ON_TRIP:
  //     case SocketActions.BOOK_SEAT_ON_TRIP:
  //     case SocketActions.VOID_SEAT_ON_TRIP:
  //     default:
  //       return new Promise((resolve) => {
  //         resolve({
  //           status: 200,
  //           message: "",
  //           data: null,
  //         });
  //       });
  //   }
  // }
  //
  // private fetchTripData(data: any, socket: Socket) {
  //   return new Promise((resolve) => {
  //     this.redisPool
  //       .acquire()
  //       .then((client) => {
  //         client
  //           .hgetall(getTripRoom(data["trip_id"]), (data) => {})
  //           .then((data) => {
  //             if (data) {
  //               resolve({
  //                 status: 200,
  //                 message: "Success",
  //                 data: data,
  //               });
  //             } else {
  //               resolve({
  //                 status: 404,
  //                 message: "Trip data doesn't exist",
  //                 data: null,
  //               });
  //             }
  //           })
  //           .catch((e) => {
  //             resolve({
  //               status: 500,
  //               message: "Unable to get data from redis store",
  //               data: null,
  //             });
  //           });
  //       })
  //       .catch((e) => {
  //         resolve({
  //           status: 500,
  //           message: "Failed to acquire redis connection",
  //           data: null,
  //         });
  //       });
  //   });
  // }
  //
  // private addNewTrip(data: any, socket: Socket) {
  //   return new Promise((resolve) => {
  //     TripService.findById(data["trip_id"], {
  //       include: [Passenger, { model: Vehicle, include: [SeatNumber] }],
  //     })
  //       .then((trip) => {
  //         if (trip) {
  //           this.redisPool
  //             .acquire()
  //             .then((client) => {
  //               client
  //                 .hset(getTripRoom(data["trip_id"]), trip.toJSON())
  //                 .then(() => {
  //                   resolve({
  //                     status: 200,
  //                     message: "Success",
  //                     data: trip.toJSON(),
  //                   });
  //                 })
  //                 .catch((e) => {
  //                   resolve({
  //                     status: 500,
  //                     message: "Failed to acquire redis connection",
  //                     data: null,
  //                   });
  //                 });
  //               socket.join(getTripRoom(data["trip_id"]));
  //             })
  //             .catch((e) => {
  //               resolve({
  //                 status: 500,
  //                 message: "Failed to acquire redis connection",
  //                 data: null,
  //               });
  //             });
  //         } else {
  //           resolve({
  //             status: 404,
  //             message: "Trip doesn't exist",
  //             data: null,
  //           });
  //         }
  //       })
  //       .catch((e) => {
  //         resolve({
  //           status: 500,
  //           message: "Internal Server Error",
  //           data: null,
  //         });
  //       });
  //   });
  // }
}
