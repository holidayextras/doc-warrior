/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table somedocs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `somedocs`;

CREATE TABLE `somedocs` (
  `type` varchar(55) NOT NULL DEFAULT '',
  `rules` mediumtext NOT NULL,
  `content` text NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `type` (`type`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `somedocs` WRITE;
/*!40000 ALTER TABLE `somedocs` DISABLE KEYS */;

INSERT INTO `somedocs` (`type`, `rules`, `content`, `date`)
VALUES
  ('readme','{\"equals\":{\"foo\":[\"bar\"]}}','Some basic readme that absolutely does equal foo bar!','2015-01-01 12:00:00'),
  ('rules','{\"notEquals\":{\"foo\":[\"bar\"]}}','An equally basic readme that wants nothing to do with foo bar!','2015-01-01 12:00:00'),
  ('thanks','{}','Well, you got this far! thanks for looking...all feedback welcome, raise an issue or contribute with a PR!','2015-01-01 12:00:00'),
  ('credits','{}','By Andrew Cashmore @ Holiday Extras','2015-01-01 12:00:00');

/*!40000 ALTER TABLE `somedocs` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
