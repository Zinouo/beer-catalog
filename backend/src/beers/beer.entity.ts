import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class Beer {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    name: string;
  
    @Column()
    category: string;
  
    @Column('text')
    description: string;
  
    @Column('float')
    alcoholPercentage: number;
  
    @Column({ type: 'bytea', array: true, default: '{}' })
    pictures: Buffer[];
  
    @Column({ type: 'timestamptz', nullable: true })
    validityStart: Date | null;
  
    @Column({ type: 'timestamptz', nullable: true })
    validityEnd: Date | null;
  
    @Column()
    createdBy: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }