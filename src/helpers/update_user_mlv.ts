import { Level } from 'src/modules/level/level.entity';
import { Major } from 'src/modules/major/major.entity';
import { Technology } from 'src/modules/technology/technology.entity';
import { Repository } from 'typeorm';

export const updateUserCount = async (
  majorRepo: Repository<Major>,
  levelRepo: Repository<Level>,
  techRepo: Repository<Technology>,
) => {
  await majorRepo
    .createQueryBuilder()
    .update()
    .set({
      user_count: () => `
    (
      SELECT COUNT(*)
      FROM user_majors um
      WHERE um."majorId" = id   
    )
  `,
    })
    .execute();

  await levelRepo
    .createQueryBuilder() // 1) bind Major entity với alias là "m"
    .update() // 2) khởi tạo UpdateQueryBuilder trên entity đã bind
    .set({
      user_count: () => `
      (
        SELECT COUNT(*)
        FROM user_levels um
        WHERE um."levelId" = id
      )
    `,
    })
    .execute();

  await techRepo
    .createQueryBuilder() // 1) bind Major entity với alias là "m"
    .update() // 2) khởi tạo UpdateQueryBuilder trên entity đã bind
    .set({
      user_count: () => `
      (
        SELECT COUNT(*)
        FROM user_technologies um
        WHERE um."technologyId" = id
      )
    `,
    })
    .execute();
};
