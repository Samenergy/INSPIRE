
from typing import Optional
from datetime import datetime

from app.models import Company, CompanyCreate
from app.database_mysql import get_mysql_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from loguru import logger

class CompanyService:

    async def create_company(self, session: AsyncSession, company_data: CompanyCreate) -> Company:
        try:
            from app.database_mysql import MySQLCompany

            stmt = select(MySQLCompany).where(
                MySQLCompany.name == company_data.name
            )
            result = await session.execute(stmt)
            existing_company = result.scalar_one_or_none()

            if existing_company:
                logger.info(f"Company already exists: {company_data.name}, updating location if different")

                if existing_company.location != company_data.location:
                    stmt = update(MySQLCompany).where(
                        MySQLCompany.id == existing_company.id
                    ).values(
                        location=company_data.location,
                        updated_at=datetime.utcnow()
                    )
                    await session.execute(stmt)
                    await session.commit()
                    existing_company.location = company_data.location
                    existing_company.updated_at = datetime.utcnow()

                return Company(
                    id=existing_company.id,
                    name=existing_company.name,
                    location=existing_company.location,
                    website=existing_company.website,
                    industry=existing_company.industry,
                    description=existing_company.description,
                    created_at=existing_company.created_at,
                    updated_at=existing_company.updated_at,
                    last_scraped=existing_company.last_scraped,
                    scrape_count=existing_company.scrape_count
                )

            new_company = MySQLCompany(
                name=company_data.name,
                location=company_data.location,
                website=company_data.website,
                industry=company_data.industry,
                description=company_data.description
            )

            session.add(new_company)
            await session.commit()
            await session.refresh(new_company)

            logger.info(f"Created new company: {new_company.name} with ID: {new_company.id}")

            return Company(
                id=new_company.id,
                name=new_company.name,
                location=new_company.location,
                website=new_company.website,
                industry=new_company.industry,
                description=new_company.description,
                created_at=new_company.created_at,
                updated_at=new_company.updated_at,
                last_scraped=new_company.last_scraped,
                scrape_count=new_company.scrape_count
            )

        except Exception as e:
            logger.error(f"Failed to create company: {e}")
            await session.rollback()
            raise

    async def update_company_linkedin_url(self, session: AsyncSession, company_id: int, linkedin_url: str) -> bool:
        try:
            from app.database_mysql import MySQLCompany

            stmt = update(MySQLCompany).where(
                MySQLCompany.id == company_id
            ).values(
                linkedin_url=linkedin_url,
                updated_at=datetime.utcnow()
            )

            result = await session.execute(stmt)
            await session.commit()

            return result.rowcount > 0

        except Exception as e:
            logger.error(f"Failed to update company LinkedIn URL: {e}")
            await session.rollback()
            raise

