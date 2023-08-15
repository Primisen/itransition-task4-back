import {DataType, Model, Column, Table} from "sequelize-typescript";

@Table({
    tableName: "user",
    timestamps: false,
    underscored: true,
})

export class User extends Model {

    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    id!: number;


    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;


    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    login!: string;


    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;


    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    registrationDate!: Date;


    @Column({
        type: DataType.DATE,
        // allowNull: false,
    })
    lastLoginDate!: Date;


    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    isActive!: boolean;
}